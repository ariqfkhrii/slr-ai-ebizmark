<?php

namespace App\Services;

use App\Models\AutoReporting;
use App\Models\ResearchPlan;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoReportingService
{
    public function listItems(int $researchPlanId): Collection
    {
        $this->ensureDefaultItems($researchPlanId);

        return AutoReporting::query()
            ->where('research_plan_id', $researchPlanId)
            ->orderBy('order_no')
            ->get();
    }

    public function ensureDefaultItems(int $researchPlanId): Collection
    {
        $existing = AutoReporting::query()->where('research_plan_id', $researchPlanId)->count();

        if ($existing > 0) {
            return AutoReporting::query()->where('research_plan_id', $researchPlanId)->orderBy('order_no')->get();
        }

        $items = $this->prismaTemplates();

        foreach ($items as $index => $item) {
            $existing = AutoReporting::query()
                ->where('research_plan_id', $researchPlanId)
                ->where('chapter', $item['chapter'])
                ->where('title', $item['title'])
                ->first();

            if ($existing) {
                $existing->forceFill([
                    'detail' => $item['detail'],
                    'order_no' => $index + 1,
                    'status' => $existing->status ?? 'draft',
                ])->save();

                continue;
            }

            AutoReporting::query()->create([
                'research_plan_id' => $researchPlanId,
                'chapter' => $item['chapter'],
                'title' => $item['title'],
                'detail' => $item['detail'],
                'order_no' => $index + 1,
                'status' => 'draft',
            ]);
        }

        return AutoReporting::query()->where('research_plan_id', $researchPlanId)->orderBy('order_no')->get();
    }

    public function generate(int $id): AutoReporting
    {
        $item = AutoReporting::query()->findOrFail($id);

        $context = $this->prepareContext($item->researchPlan);
        $prompt  = $this->buildPrompt($item, $context);
        $result  = $this->callGemini($prompt);

        // Jika Gemini gagal, lempar exception agar konten lama tidak tertimpa
        if ($result === null) {
            throw new \RuntimeException('Gemini API tidak berhasil setelah beberapa percobaan. Coba lagi nanti.');
        }

        $content = trim((string) ($result['narrative'] ?? ''));

        // Pastikan konten tidak kosong sebelum disimpan
        if ($content === '') {
            throw new \RuntimeException('Gemini mengembalikan konten kosong. Coba lagi nanti.');
        }

        $item->forceFill([
            'generated_content' => $content,
            'word_count'        => $this->countWords($content),
            'status'            => 'generated',
        ])->save();

        return $item;
    }

    public function update(int $id, ?string $content): AutoReporting
    {
        $item = AutoReporting::query()->findOrFail($id);
        $item->forceFill([
            'generated_content' => $content,
            'word_count'        => $this->countWords((string) $content),
            'status'            => $content ? 'generated' : 'draft',
        ])->save();

        return $item;
    }

    public function regenerate(int $id): AutoReporting
    {
        // Sama dengan generate — exception akan mencegah overwrite konten lama
        return $this->generate($id);
    }

    private function prepareContext(?ResearchPlan $researchPlan): array
    {
        if (! $researchPlan) {
            return [
                'research_plan' => null,
                'metadata' => [],
                'extractions' => [],
                'classifications' => [],
                'prisma_stats' => [],
            ];
        }

        $articles = $researchPlan->filteredArticles()
            ->where('included', true)
            ->with([
                'rawArticle:id,title,authors,abstract,publish_year,source_db,doi',
                'review.articleClassification',
                'review.extractionResult',
            ])
            ->get();

        $metadata = $articles->map(fn ($article) => [
            'id' => $article->id,
            'title' => $article->rawArticle?->title,
            'authors' => $article->rawArticle?->authors,
            'doi' => $article->rawArticle?->doi,
            'year' => $article->rawArticle?->publish_year,
            'source_db' => $article->rawArticle?->source_db,
            'included' => $article->included,
            'retrieved' => $article->retrieved,
        ])->values();

        $extractions = $articles->map(fn ($article) => [
            'article_id' => $article->id,
            'title' => $article->rawArticle?->title,
            'abstract' => $article->review?->extractionResult?->abstract,
            'introduction' => $article->review?->extractionResult?->introduction,
            'result' => $article->review?->extractionResult?->result,
            'conclusion' => $article->review?->extractionResult?->conclusion,
            'recommendation' => $article->review?->extractionResult?->recommendation,
            'limitation' => $article->review?->extractionResult?->limitation,
        ])->values();

        $classifications = $articles->map(fn ($article) => [
            'article_id' => $article->id,
            'title' => $article->rawArticle?->title,
            'research_method' => $article->review?->articleClassification?->research_method,
            'category_1' => $article->review?->articleClassification?->category_1,
            'category_2' => $article->review?->articleClassification?->category_2,
            'category_3' => $article->review?->articleClassification?->category_3,
            'grand_theory' => $article->review?->articleClassification?->grand_theory,
        ])->values();

        return [
            'research_plan' => [
                'research_plan_id' => $researchPlan->research_plan_id,
                'title' => $researchPlan->title,
                'source_database' => $researchPlan->source_database,
                'scopus_quantity' => $researchPlan->scopus_quantity,
                'pubmed_quantity' => $researchPlan->pubmed_quantity,
            ],
            'metadata' => $metadata,
            'extractions' => $extractions,
            'classifications' => $classifications,
            'prisma_stats' => [
                'included_articles' => $articles->count(),
                'total_articles' => $researchPlan->filteredArticles()->count(),
                'generated_sections' => AutoReporting::query()->where('research_plan_id', $researchPlan->research_plan_id)->where('status', 'generated')->count(),
            ],
        ];
    }

    private function buildPrompt(AutoReporting $item, array $context): string
    {
        return "You are writing an SLR auto-reporting section for PRISMA.
Use only the structured data provided below. Do not invent unsupported findings.
Return strict JSON with keys narrative, evidence_points, confidence.

Chapter: {$item->chapter}
Title: {$item->title}
Instruction: {$item->detail}

Structured context:
".json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)."\n\nRules:
- Keep the narrative concise and evidence-based.
- If data is unavailable, explicitly say that the section is still a draft.
- Prefer bullet-style evidence_points when possible.";
    }

    private function callGemini(string $prompt): ?array
    {
        $apiKey = (string) config('services.gemini.api_key', env('GEMINI_API_KEY'));

        if ($apiKey === '') {
            Log::warning('Gemini API key missing for auto reporting.');

            return null;
        }

        $payload = [
            'contents' => [[
                'role'  => 'user',
                'parts' => [['text' => $prompt]],
            ]],
            'generationConfig' => [
                'temperature'      => 0.2,
                'responseMimeType' => 'application/json',
                'responseSchema'   => [
                    'type'       => 'object',
                    'properties' => [
                        'narrative'       => ['type' => 'string'],
                        'evidence_points' => ['type' => 'array', 'items' => ['type' => 'string']],
                        'confidence'      => ['type' => 'number'],
                    ],
                    'required' => ['narrative', 'evidence_points', 'confidence'],
                ],
            ],
        ];

        $response        = null;
        $maxAttempts     = 4;
        $baseDelayMs     = 2000;
        $url             = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='.$apiKey;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            $response = Http::timeout(60)->post($url, $payload);

            if ($response->successful()) {
                break;
            }

            $status      = $response->status();
            $shouldRetry = $this->isGeminiRetryableStatus($status) && $attempt < $maxAttempts;

            Log::warning('Gemini auto reporting request failed', [
                'status'      => $status,
                'body'        => $response->body(),
                'attempt'     => $attempt,
                'will_retry'  => $shouldRetry,
            ]);

            if (! $shouldRetry) {
                return null;
            }

            // Exponential backoff: 2s, 4s, 8s + jitter
            $delayMs = ($baseDelayMs * (2 ** ($attempt - 1))) + random_int(0, 500);
            usleep($delayMs * 1000);
        }

        if (! $response || ! $response->successful()) {
            return null;
        }

        $text    = data_get($response->json(), 'candidates.0.content.parts.0.text');
        $decoded = is_string($text) ? json_decode($text, true) : null;

        if (! is_array($decoded)) {
            Log::warning('Gemini auto reporting response invalid JSON', ['text' => $text]);

            return null;
        }

        return [
            'narrative'       => trim((string) ($decoded['narrative'] ?? '')),
            'evidence_points' => is_array($decoded['evidence_points'] ?? null)
                ? array_map('strval', $decoded['evidence_points'])
                : [],
            'confidence'      => is_numeric($decoded['confidence'] ?? null)
                ? (float) $decoded['confidence']
                : 0.0,
        ];
    }

    private function isGeminiRetryableStatus(int $status): bool
    {
        return in_array($status, [429, 500, 502, 503, 504], true);
    }

    private function countWords(?string $text): int
    {
        if (! is_string($text)) {
            return 0;
        }

        return count(preg_split('/\s+/u', trim($text)) ?: []);
    }

    private function prismaTemplates(): array
    {
        return [
            ['chapter' => 'Introduction', 'title' => 'Rationale', 'detail' => 'Describe the rationale for the review in the context of existing knowledge.'],
            ['chapter' => 'Introduction', 'title' => 'Objectives', 'detail' => 'Provide an explicit statement of the objective(s) or question(s) the review addresses.'],
            ['chapter' => 'Methods', 'title' => 'Eligibility Criteria', 'detail' => 'Specify the inclusion and exclusion criteria for the review and how studies were grouped for the syntheses.'],
            ['chapter' => 'Methods', 'title' => 'Information Sources', 'detail' => 'Specify all databases, registers, websites, organisations, reference lists and other sources searched or consulted to identify studies.'],
            ['chapter' => 'Methods', 'title' => 'Search Strategy', 'detail' => 'Present the full search strategies for all databases, registers and websites, including any filters and limits used.'],
            ['chapter' => 'Methods', 'title' => 'Selection Process', 'detail' => 'Specify the methods used to decide whether a study met the inclusion criteria of the review.'],
            ['chapter' => 'Methods', 'title' => 'Data Collection Process', 'detail' => 'Specify the methods used to collect data from reports, including how many reviewers collected data from each report.'],
            ['chapter' => 'Methods', 'title' => 'Data Items', 'detail' => 'List and define all outcomes and other variables for which data were sought.'],
            ['chapter' => 'Methods', 'title' => 'Study Risk of Bias Assessment', 'detail' => 'Specify the methods used to assess risk of bias in the included studies.'],
            ['chapter' => 'Methods', 'title' => 'Effect Measures', 'detail' => 'Specify for each outcome the effect measure(s) used in the synthesis or presentation of results.'],
            ['chapter' => 'Methods', 'title' => 'Synthesis Methods', 'detail' => 'Describe the methods used to synthesise results and provide a rationale for the choice(s).'],
            ['chapter' => 'Methods', 'title' => 'Reporting Bias Assessment', 'detail' => 'Describe any methods used to assess risk of bias due to missing results in a synthesis.'],
            ['chapter' => 'Methods', 'title' => 'Certainty Assessment', 'detail' => 'Describe any methods used to assess certainty in the body of evidence.'],
            ['chapter' => 'Results', 'title' => 'Study Selection', 'detail' => 'Describe the results of the search and selection process, from the number of records identified to the number of studies included.'],
            ['chapter' => 'Results', 'title' => 'Study Characteristics', 'detail' => 'Cite each included study and present its characteristics.'],
            ['chapter' => 'Results', 'title' => 'Risk of Bias in Studies', 'detail' => 'Present assessments of risk of bias for each included study.'],
            ['chapter' => 'Results', 'title' => 'Results of Individual Studies', 'detail' => 'Present the findings of each study, including summary statistics and effect estimates where appropriate.'],
            ['chapter' => 'Results', 'title' => 'Results of Syntheses', 'detail' => 'Present results of all statistical syntheses conducted.'],
            ['chapter' => 'Results', 'title' => 'Reporting Biases', 'detail' => 'Present assessments of risk of bias due to missing results for each synthesis assessed.'],
            ['chapter' => 'Results', 'title' => 'Certainty of Evidence', 'detail' => 'Present assessments of certainty in the body of evidence for each outcome assessed.'],
            ['chapter' => 'Discussion', 'title' => 'Interpretation of Results', 'detail' => 'Provide a general interpretation of the results in the context of other evidence.'],
            ['chapter' => 'Discussion', 'title' => 'Limitations of Evidence', 'detail' => 'Discuss any limitations of the evidence included in the review.'],
            ['chapter' => 'Discussion', 'title' => 'Limitations of Review Process', 'detail' => 'Discuss any limitations of the review processes used.'],
            ['chapter' => 'Discussion', 'title' => 'Implications for Practice, Policy, and Future Research', 'detail' => 'Discuss implications of the results for practice, policy, and future research.'],
        ];
    }
}
