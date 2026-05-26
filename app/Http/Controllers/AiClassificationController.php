<?php

namespace App\Http\Controllers;

use App\Models\ArticleClassification;
use App\Models\ClassificationSetup;
use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\Process\Process;

class AiClassificationController extends Controller
{
    public function run(Request $request)
    {
        $validated = $request->validate([
            'research_plan_id' => [
                'required',
                'integer',
                Rule::exists('research_plans', 'research_plan_id'),
            ],
        ]);

        $researchPlan = ResearchPlan::query()
            ->where('research_plan_id', $validated['research_plan_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $researchPlan) {
            abort(403);
        }

        $setup = ClassificationSetup::query()
            ->where('research_plan_id', $researchPlan->research_plan_id)
            ->first([
                'category_1',
                'category_2',
                'category_3',
                'category_4',
                'category_5',
                'category_6',
                'theory',
            ]);

        $categories = $this->buildActiveCategories($setup);

        if ($categories === []) {
            return response()->json([
                'message' => 'Classification setup belum diisi.',
            ], 422);
        }

        $articles = FilteredArticle::query()
            ->where('research_plan_id', $researchPlan->research_plan_id)
            ->where('retrieved', 'Retrieved')
            ->with([
                'rawArticle:article_id,title,abstract,authors,publish_year',
            ])
            ->get([
                'filtered_article_id',
                'raw_article_id',
                'research_plan_id',
                'pdf_path',
            ]);

        $results = [];

        foreach ($articles as $article) {
            $promptPayload = $this->buildPromptPayload($article, $setup, $categories);

            $ai = $this->callGemini($promptPayload['prompt'], $categories);

            if (! $ai) {
                continue;
            }

            $review = Review::query()->firstOrCreate([
                'article_id' => $article->filtered_article_id,
            ]);

            $payload = [
                'research_method' => $ai['research_method'] ?? null,
                'grand_theory' => $ai['grand_theory'] ?? null,
            ];

            foreach ($categories as $category) {
                $key = 'category_'.$category['id'];
                if (array_key_exists($category['id'], $ai['categories'])) {
                    $payload[$key] = $ai['categories'][$category['id']];
                }
            }

            ArticleClassification::query()->updateOrCreate([
                'review_id' => $review->review_id,
            ], $payload);

            $results[] = [
                'article_id' => $article->filtered_article_id,
                'research_method' => $ai['research_method'] ?? null,
                'grand_theory' => $ai['grand_theory'] ?? null,
                'categories' => $ai['categories'],
            ];
        }

        return response()->json([
            'processed' => count($results),
            'total' => $articles->count(),
            'results' => $results,
        ]);
    }

    private function buildActiveCategories(?ClassificationSetup $setup): array
    {
        if (! $setup) {
            return [];
        }

        $list = [
            1 => $setup->category_1,
            2 => $setup->category_2,
            3 => $setup->category_3,
            4 => $setup->category_4,
            5 => $setup->category_5,
            6 => $setup->category_6,
        ];

        $categories = [];

        foreach ($list as $id => $name) {
            $trimmed = trim((string) $name);
            if ($trimmed === '') {
                continue;
            }

            $categories[] = [
                'id' => $id,
                'name' => $trimmed,
            ];
        }

        return $categories;
    }

    private function buildPromptPayload(
        FilteredArticle $article,
        ?ClassificationSetup $setup,
        array $categories,
    ): array {
        $raw = $article->rawArticle;
        $abstract = $raw?->abstract ?? '';
        $title = $raw?->title ?? '';
        $authors = $raw?->authors ?? '';
        $year = $raw?->publish_year ?? '';
        $theory = $setup?->theory ?? '';

        $pdfText = $this->extractPdfText($article->pdf_path);
        $pdfSnippet = $this->truncateText($pdfText, 6000);
        $abstractSnippet = $this->truncateText($abstract, 1500);

        $categoryLines = collect($categories)
            ->map(fn ($category) => "{$category['id']}. {$category['name']}")
            ->implode("\n");

        $prompt = "You are classifying research articles.\n".
            "Return JSON that matches the provided schema.\n\n".
            "Article Metadata:\n".
            "Title: {$title}\n".
            "Authors: {$authors}\n".
            "Year: {$year}\n\n".
            "Abstract:\n{$abstractSnippet}\n\n".
            ($pdfSnippet !== '' ? "PDF Text Excerpt:\n{$pdfSnippet}\n\n" : '').
            ($theory !== '' ? "Theory/Notes:\n{$theory}\n\n" : '').
            "Classification categories (fill only these):\n{$categoryLines}\n\n".
            "Provide concise outputs in Indonesian.";

        return [
            'prompt' => $prompt,
        ];
    }

    private function extractPdfText(?string $storedPath): string
    {
        if (! $storedPath) {
            return '';
        }

        if (! Storage::disk('public')->exists($storedPath)) {
            return '';
        }

        $fullPath = Storage::disk('public')->path($storedPath);

        $process = new Process([
            'pdftotext',
            '-layout',
            '-enc',
            'UTF-8',
            $fullPath,
            '-',
        ]);

        try {
            $process->run();
        } catch (\Throwable $exception) {
            Log::warning('pdftotext failed', [
                'error' => $exception->getMessage(),
                'path' => $storedPath,
            ]);

            return '';
        }

        if (! $process->isSuccessful()) {
            Log::warning('pdftotext error', [
                'error' => trim($process->getErrorOutput()),
                'path' => $storedPath,
            ]);

            return '';
        }

        return $process->getOutput() ?: '';
    }

    private function truncateText(string $text, int $maxLength): string
    {
        $normalized = preg_replace('/\s+/', ' ', $text) ?? $text;

        if (mb_strlen($normalized) <= $maxLength) {
            return trim($normalized);
        }

        return trim(mb_substr($normalized, 0, $maxLength));
    }

    private function callGemini(string $prompt, array $categories): ?array
    {
        $apiKey = (string) config('services.gemini.api_key', env('GEMINI_API_KEY'));

        if ($apiKey === '') {
            Log::warning('Gemini API key missing.');

            return null;
        }

        $schema = $this->buildResponseSchema($categories);

        $response = Http::timeout(30)
            ->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='.$apiKey,
                [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'responseMimeType' => 'application/json',
                        'responseSchema' => $schema,
                    ],
                ],
            );

        if (! $response->successful()) {
            Log::warning('Gemini request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (! $text || ! is_string($text)) {
            Log::warning('Gemini response missing text');

            return null;
        }

        $decoded = json_decode($text, true);

        if (! is_array($decoded)) {
            Log::warning('Gemini response invalid JSON', ['text' => $text]);

            return null;
        }

        $categoriesPayload = (array) ($decoded['categories'] ?? []);
        $normalizedCategories = [];

        foreach ($categories as $category) {
            $id = (string) $category['id'];
            $value = $categoriesPayload[$id] ?? null;
            $normalizedCategories[$category['id']] = $value ? trim((string) $value) : null;
        }

        return [
            'research_method' => isset($decoded['research_method'])
                ? trim((string) $decoded['research_method'])
                : null,
            'grand_theory' => isset($decoded['grand_theory'])
                ? trim((string) $decoded['grand_theory'])
                : null,
            'categories' => $normalizedCategories,
        ];
    }

    private function buildResponseSchema(array $categories): array
    {
        $categoryProps = [];

        foreach ($categories as $category) {
            $categoryProps[(string) $category['id']] = [
                'type' => 'string',
            ];
        }

        return [
            'type' => 'object',
            'properties' => [
                'research_method' => ['type' => 'string'],
                'grand_theory' => ['type' => 'string'],
                'categories' => [
                    'type' => 'object',
                    'properties' => $categoryProps,
                ],
            ],
            'required' => ['research_method', 'categories'],
        ];
    }
}
