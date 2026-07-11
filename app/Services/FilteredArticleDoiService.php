<?php

namespace App\Services;

use App\Models\FilteredArticle;
use App\Models\RawArticle;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class FilteredArticleDoiService
{
    /**
     * Extract DOI values from uploaded PDF content and match them to raw_articles.
     */
    public function extractAndMatch(UploadedFile $pdfFile, int $researchPlanId, string $storedPath): array
    {
        $text = $this->extractTextFromPdf($pdfFile);

        if ($text === '') {
            return [
                'dois' => [],
                'doi_found_count' => 0,
                'matched_count' => 0,
                'created_count' => 0,
                'matched_article_ids' => [],
            ];
        }

        $dois = $this->extractDois($text);

        if ($dois === []) {
            return [
                'dois' => [],
                'doi_found_count' => 0,
                'matched_count' => 0,
                'created_count' => 0,
                'matched_article_ids' => [],
            ];
        }

        $matchedRawArticles = RawArticle::query()
            ->whereIn('doi', $dois)
            ->get(['id', 'doi']);

        Log::info('DOI extraction result', [
            'doi_found_count' => count($dois),
            'dois' => $dois,
            'matched_count' => $matchedRawArticles->count(),
            'matched_article_ids' => $matchedRawArticles->pluck('id')->all(),
        ]);

        $createdCount = 0;

        foreach ($matchedRawArticles as $rawArticle) {
            $filteredArticle = FilteredArticle::query()->updateOrCreate(
                [
                    'raw_article_id' => $rawArticle->id,
                    'research_plan_id' => $researchPlanId,
                ],
                [
                    'included' => true,
                    'retrieved' => 1,
                    'ai_usage_status' => 0,
                    'pdf_path' => $storedPath,
                ]
            );

            if ($filteredArticle->wasRecentlyCreated) {
                $createdCount++;
            }
        }

        return [
            'dois' => $dois,
            'doi_found_count' => count($dois),
            'matched_count' => $matchedRawArticles->count(),
            'created_count' => $createdCount,
            'matched_article_ids' => $matchedRawArticles->pluck('id')->all(),
        ];
    }

    private function extractDois(string $text): array
    {
        $normalizedText = preg_replace('/[\x{200B}-\x{200D}\x{FEFF}]/u', '', $text) ?? $text;
        $normalizedText = preg_replace('/\s+/', ' ', $normalizedText) ?? $normalizedText;

        preg_match_all(
            '/(?:https?:\/\/(?:dx\.)?doi\.org\/)?(10\.\d{4,9}\s*\/\s*[\w.()\/:;-]+)/i',
            $normalizedText,
            $matches
        );

        if (!isset($matches[1]) || $matches[1] === []) {
            preg_match_all(
                '/(10\.\d{4,9}\s*\/\s*\S+)/i',
                $normalizedText,
                $matches
            );
        }

        if (!isset($matches[1])) {
            return [];
        }

        $normalized = array_map(function (string $doi): string {
            $doi = strtolower(trim($doi));
            $doi = preg_replace('/\s+/', '', $doi) ?? $doi;

            return rtrim($doi, '.,;:)\]\}>"\'');
        }, $matches[1]);

        return array_values(array_unique(array_filter($normalized)));
    }

    private function extractTextFromPdf(UploadedFile $pdfFile): string
    {
        $pdftotext = new Process([
            'pdftotext',
            '-layout',
            '-enc',
            'UTF-8',
            $pdfFile->getRealPath(),
            '-',
        ]);

        try {
            $pdftotext->run();
        } catch (\Throwable $exception) {
            Log::warning('pdftotext failed to run', [
                'error' => $exception->getMessage(),
                'file_name' => $pdfFile->getClientOriginalName(),
            ]);
        }

        if ($pdftotext->isSuccessful()) {
            $output = $pdftotext->getOutput();

            if ($output !== '') {
                Log::info('pdftotext extraction succeeded', [
                    'file_name' => $pdfFile->getClientOriginalName(),
                    'text_length' => strlen($output),
                ]);

                return $output;
            }
        } else {
            Log::warning('pdftotext extraction failed', [
                'file_name' => $pdfFile->getClientOriginalName(),
                'error' => trim($pdftotext->getErrorOutput()),
            ]);
        }

        return '';
    }
}