<?php

namespace App\Services;

use App\Models\Extraction;
use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use App\Models\Review;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use Symfony\Component\Process\Process;

class AiExtractionService
{
    public function run(int $researchPlanId, int $userId): array
    {
        $researchPlan = ResearchPlan::query()
            ->where('research_plan_id', $researchPlanId)
            ->where('user_id', $userId)
            ->first();

        if (! $researchPlan) {
            abort(403);
        }

        $articles = FilteredArticle::query()
            ->where('research_plan_id', $researchPlan->research_plan_id)
            ->where('retrieved', 1)
            ->whereNotNull('pdf_path')
            ->with([
                'rawArticle:id,title,abstract,authors,publish_year',
            ])
            ->get([
                'id',
                'raw_article_id',
                'research_plan_id',
                'pdf_path',
            ]);

        $results = [];

        foreach ($articles as $article) {
            $prompt = $this->buildPrompt($article);
            $ai = $this->callGemini($prompt);

            if ($this->hasMissingSections($ai)) {
                $retryPrompt = $this->buildRetryPrompt($article);
                $retry = $this->callGemini($retryPrompt);
                $ai = $this->mergeAiResults($ai, $retry);
            }

            if (! $ai) {
                continue;
            }

            $review = Review::query()->firstOrCreate([
                'article_id' => $article->id,
            ]);

            $payload = [
                'abstract' => $ai['abstract'] ?? null,
                'introduction' => $ai['introduction'] ?? null,
                'result' => $ai['result'] ?? null,
                'conclusion' => $ai['conclusion'] ?? null,
                'recommendation' => $ai['recommendation'] ?? null,
                'novelty_gap' => $ai['novelty_gap'] ?? null,
                'future_research' => $ai['future_research'] ?? null,
                'limitation' => $ai['limitation'] ?? null,
                'input_method' => 'ai',
                'validation_status' => 'pending',
                'confidence_score' => $ai['confidence_score'] ?? null,
            ];

            Extraction::query()->updateOrCreate([
                'review_id' => $review->review_id,
            ], $payload);

            $results[] = array_merge(
                ['article_id' => $article->id],
                $payload,
            );
        }

        return [
            'processed' => count($results),
            'total' => $articles->count(),
            'results' => $results,
        ];
    }

    private function buildPrompt(FilteredArticle $article): string
    {
        $raw = $article->rawArticle;
        $abstract = $raw?->abstract ?? '';
        $title = $raw?->title ?? '';
        $authors = $raw?->authors ?? '';
        $year = $raw?->publish_year ?? '';

        $pdfText = $this->extractPdfText($article->pdf_path);
        $cleanText = $this->removeReferenceSection($pdfText);
        $sections = $this->extractSections($cleanText);
        if ($this->isDemoAbstract($abstract)) {
            $abstract = '';
        }
        $abstractSnippet = $this->truncateText($abstract, 1200);
        $abstractFromPdf = $sections['abstract'] ?? '';
        $abstractPrompt = $abstractFromPdf !== '' ? $abstractFromPdf : $abstractSnippet;
        $abstractLabel = $abstractFromPdf !== '' ? 'Abstract (full text)' : 'Abstract (metadata)';

        return "You are extracting sections from a research article.\n".
            "Return JSON that matches the provided schema.\n\n".
            "Article Metadata:\n".
            "Title: {$title}\n".
            "Authors: {$authors}\n".
            "Year: {$year}\n\n".
            "{$abstractLabel}:\n{$abstractPrompt}\n\n".
            ($sections['introduction'] !== ''
                ? "Introduction Excerpt:\n{$sections['introduction']}\n\n"
                : '')
            .($sections['result'] !== '' ? "Result Excerpt:\n{$sections['result']}\n\n" : '')
            .($sections['conclusion'] !== ''
                ? "Conclusion Excerpt:\n{$sections['conclusion']}\n\n"
                : '')
            .($sections['recommendation'] !== ''
                ? "Recommendation Excerpt:\n{$sections['recommendation']}\n\n"
                : '')
            .($sections['novelty_gap'] !== ''
                ? "Novelty/Gap Excerpt:\n{$sections['novelty_gap']}\n\n"
                : '')
            .($sections['limitation'] !== ''
                ? "Limitation Excerpt:\n{$sections['limitation']}\n\n"
                : '')
            .($sections['future_research'] !== ''
                ? "Future Research Excerpt:\n{$sections['future_research']}\n\n"
                : '')
            ."Rules:\n".
            "- Use the excerpts above when available (prefer full-text).\n".
            "- If a section is not found, return an empty string.\n".
            "- Keep each section concise (1-3 paragraphs).";
    }

    private function buildRetryPrompt(FilteredArticle $article): string
    {
        $raw = $article->rawArticle;
        $title = $raw?->title ?? '';
        $authors = $raw?->authors ?? '';
        $year = $raw?->publish_year ?? '';

        $pdfText = $this->extractPdfText($article->pdf_path);
        $cleanText = $this->removeReferenceSection($pdfText);
        $focusedText = $this->truncateText($cleanText, 5000);

        return "Retry extraction with stricter focus.\n".
            "Return JSON that matches the provided schema.\n\n".
            "Article Metadata:\n".
            "Title: {$title}\n".
            "Authors: {$authors}\n".
            "Year: {$year}\n\n".
            "Full Text Excerpt:\n{$focusedText}\n\n".
            "Rules:\n".
            "- If a section is not found, return an empty string.\n".
            "- Keep each section concise (1-2 paragraphs).";
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

        $binary = (string) config('services.pdftotext.path', 'pdftotext');

        $process = new Process([
            $binary,
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
        }

        $output = $process->getOutput() ?: '';
        if ($output !== '') {
            return $output;
        }

        return $this->extractTextWithParser($fullPath, $storedPath);
    }

    private function extractTextWithParser(string $path, string $storedPath): string
    {
        if (! class_exists(Parser::class)) {
            Log::warning('pdfparser not available', [
                'path' => $storedPath,
            ]);

            return '';
        }

        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($path);
            $text = trim((string) $pdf->getText());
        } catch (\Throwable $exception) {
            Log::warning('pdfparser failed', [
                'error' => $exception->getMessage(),
                'path' => $storedPath,
            ]);

            return '';
        }

        if ($text !== '') {
            Log::info('pdfparser extraction succeeded', [
                'path' => $storedPath,
                'text_length' => strlen($text),
            ]);
        }

        return $text;
    }

    private function removeReferenceSection(string $text): string
    {
        if ($text === '') {
            return '';
        }

        $normalized = preg_replace('/\s+/', ' ', $text) ?? $text;
        $pattern = '/\b(references|bibliography|daftar pustaka)\b/i';

        if (preg_match($pattern, $normalized, $matches, PREG_OFFSET_CAPTURE)) {
            $offset = $matches[0][1];
            $normalized = substr($normalized, 0, $offset);
        }

        return trim($normalized);
    }

    private function extractSections(string $text): array
    {
        if ($text === '') {
            return [
                'abstract' => '',
                'introduction' => '',
                'result' => '',
                'conclusion' => '',
                'recommendation' => '',
                'novelty_gap' => '',
                'limitation' => '',
                'future_research' => '',
            ];
        }

        $normalized = preg_replace('/\r\n?/', "\n", $text) ?? $text;

        $abstract = $this->extractSection(
            $normalized,
            ['abstract'],
            ['keywords', 'introduction', 'background', 'method', 'methodology', 'materials and methods'],
            1200,
        );

        $introduction = $this->extractSection(
            $normalized,
            ['introduction', 'background'],
            ['method', 'methodology', 'materials and methods', 'results', 'result'],
            2500,
        );

        $result = $this->extractSection(
            $normalized,
            ['results', 'result', 'findings'],
            ['discussion', 'conclusion', 'conclusions', 'recommendation', 'recommendations'],
            2500,
        );

        $conclusion = $this->extractSection(
            $normalized,
            ['conclusion', 'conclusions', 'summary'],
            ['recommendation', 'recommendations', 'future work', 'future research'],
            1800,
        );

        $recommendation = $this->extractSection(
            $normalized,
            ['recommendation', 'recommendations', 'future work', 'future research'],
            ['references', 'bibliography', 'daftar pustaka', 'appendix'],
            1800,
        );

        $noveltyGap = $this->extractSection(
            $normalized,
            ['research gap', 'novelty gap', 'novelty', 'gap', 'research gaps'],
            ['method', 'methodology', 'materials and methods', 'results', 'result', 'discussion', 'conclusion'],
            1500,
        );

        $limitation = $this->extractSection(
            $normalized,
            ['limitation', 'limitations'],
            ['future work', 'future research', 'recommendation', 'references', 'bibliography', 'daftar pustaka'],
            1500,
        );

        $futureResearch = $this->extractSection(
            $normalized,
            ['future research', 'future work', 'future studies'],
            ['references', 'bibliography', 'daftar pustaka', 'appendix'],
            1500,
        );

        return [
            'abstract' => $abstract,
            'introduction' => $introduction,
            'result' => $result,
            'conclusion' => $conclusion,
            'recommendation' => $recommendation,
            'novelty_gap' => $noveltyGap,
            'limitation' => $limitation,
            'future_research' => $futureResearch,
        ];
    }

    private function extractSection(
        string $text,
        array $startKeywords,
        array $endKeywords,
        int $maxLength,
    ): string {
        $startPattern = $this->buildHeadingPattern($startKeywords);
        $endPattern = $this->buildHeadingPattern($endKeywords);

        if (! preg_match($startPattern, $text, $startMatch, PREG_OFFSET_CAPTURE)) {
            return '';
        }

        $startOffset = $startMatch[0][1] + strlen($startMatch[0][0]);
        $slice = substr($text, $startOffset);

        if ($slice === false) {
            return '';
        }

        $endOffset = null;
        if (preg_match($endPattern, $slice, $endMatch, PREG_OFFSET_CAPTURE)) {
            $endOffset = $endMatch[0][1];
        }

        $section = $endOffset !== null ? substr($slice, 0, $endOffset) : $slice;
        $section = trim(preg_replace('/\s+/', ' ', $section) ?? $section);

        return $this->truncateText($section, $maxLength);
    }

    private function buildHeadingPattern(array $keywords): string
    {
        $escaped = array_map(
            fn ($keyword) => preg_quote($keyword, '/'),
            $keywords,
        );
        $options = implode('|', $escaped);

        return '/\n\s*(?:\d+\.?\s*)?(?:'.$options.')\s*\n/i';
    }

    private function hasMissingSections(?array $ai): bool
    {
        if (! $ai) {
            return true;
        }

        foreach (['abstract', 'introduction', 'result', 'conclusion', 'recommendation'] as $key) {
            if (! isset($ai[$key]) || trim((string) $ai[$key]) === '') {
                return true;
            }
        }

        return false;
    }

    private function mergeAiResults(?array $base, ?array $retry): ?array
    {
        if (! $base) {
            return $retry;
        }

        if (! $retry) {
            return $base;
        }

        $merged = $base;

        foreach (['abstract', 'introduction', 'result', 'conclusion', 'recommendation', 'novelty_gap', 'limitation', 'future_research'] as $key) {
            if (! isset($merged[$key]) || trim((string) $merged[$key]) === '') {
                $merged[$key] = $retry[$key] ?? $merged[$key] ?? null;
            }
        }

        if (! isset($merged['confidence_score'])) {
            $merged['confidence_score'] = $retry['confidence_score'] ?? null;
        }

        return $merged;
    }

    private function truncateText(string $text, int $maxLength): string
    {
        if (mb_strlen($text) <= $maxLength) {
            return trim($text);
        }

        return trim(mb_substr($text, 0, $maxLength));
    }

    private function isDemoAbstract(?string $abstract): bool
    {
        if (! $abstract) {
            return false;
        }

        return (bool) preg_match('/\bdemo abstract\b/i', $abstract);
    }

    private function callGemini(string $prompt): ?array
    {
        $apiKey = (string) config('services.gemini.api_key', env('GEMINI_API_KEY'));

        if ($apiKey === '') {
            Log::warning('Gemini API key missing.');

            return null;
        }

        $payload = [
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
                'responseSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'abstract' => ['type' => 'string'],
                        'introduction' => ['type' => 'string'],
                        'result' => ['type' => 'string'],
                        'conclusion' => ['type' => 'string'],
                        'recommendation' => ['type' => 'string'],
                        'novelty_gap' => ['type' => 'string'],
                        'limitation' => ['type' => 'string'],
                        'future_research' => ['type' => 'string'],
                        'confidence_score' => ['type' => 'number'],
                    ],
                    'required' => [
                        'abstract',
                        'introduction',
                        'result',
                        'conclusion',
                        'recommendation',
                        'novelty_gap',
                        'limitation',
                        'future_research',
                    ],
                ],
            ],
        ];

        $response = null;
        $maxAttempts = 4;
        $baseDelaySeconds = 2;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            $response = Http::timeout(30)->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='.$apiKey,
                $payload,
            );

            if ($response->successful()) {
                break;
            }

            $status = $response->status();
            $shouldRetry = $this->isGeminiRetryableStatus($status) && $attempt < $maxAttempts;

            Log::warning('Gemini request failed', [
                'status' => $status,
                'body' => $response->body(),
                'attempt' => $attempt,
                'will_retry' => $shouldRetry,
            ]);

            if (! $shouldRetry) {
                return null;
            }

            $delayMs = ($baseDelaySeconds * (2 ** ($attempt - 1)) * 1000) + random_int(0, 500);
            usleep($delayMs * 1000);
        }

        if (! $response || ! $response->successful()) {
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

        return [
            'abstract' => isset($decoded['abstract']) ? trim((string) $decoded['abstract']) : null,
            'introduction' => isset($decoded['introduction']) ? trim((string) $decoded['introduction']) : null,
            'result' => isset($decoded['result']) ? trim((string) $decoded['result']) : null,
            'conclusion' => isset($decoded['conclusion']) ? trim((string) $decoded['conclusion']) : null,
            'recommendation' => isset($decoded['recommendation'])
                ? trim((string) $decoded['recommendation'])
                : null,
            'novelty_gap' => isset($decoded['novelty_gap']) ? trim((string) $decoded['novelty_gap']) : null,
            'limitation' => isset($decoded['limitation']) ? trim((string) $decoded['limitation']) : null,
            'future_research' => isset($decoded['future_research'])
                ? trim((string) $decoded['future_research'])
                : null,
            'confidence_score' => isset($decoded['confidence_score'])
                ? (float) $decoded['confidence_score']
                : null,
        ];
    }

    private function isGeminiRetryableStatus(int $status): bool
    {
        return in_array($status, [429, 500, 502, 503, 504], true);
    }
}