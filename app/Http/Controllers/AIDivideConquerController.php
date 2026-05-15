<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIDivideConquerController extends Controller
{
    public function process(Request $request)
    {
        $articles = $request->input('articles', []);

        // Threshold karakter untuk menentukan divide atau tidak nya
        $maxCharacters = max(
            100,
            (int) $request->input('max_characters', 500)
        );

        if (!is_array($articles) || empty($articles)) {

            return response()->json([
                'error' => 'No articles provided',
            ], 400);
        }

        $result = $this->processArticles(
            $articles,
            $maxCharacters
        );

        return response()->json([
            'method' => 'divide_and_conquer_character_based',
            'article_count' => count($articles),
            'max_characters' => $maxCharacters,
            'final_report' => $result['summary'],
            'trace' => $result['trace'],
        ]);
    }

    private function processArticles(
        array $articles,
        int $maxCharacters
    ): array {

        $totalCharacters = $this->calculateCharacters($articles);

        /*
        |--------------------------------------------------------------------------
        | STOPPING CONDITION
        |--------------------------------------------------------------------------
        | Jika tinggal 1 artikel, paksa proses.
        | Mencegah infinite recursion.
        |--------------------------------------------------------------------------
        */
        if (count($articles) <= 1) {

            $summary = $this->summarizeBatch($articles);

            return [
                'summary' => $summary,
                'trace' => [
                    'type' => 'forced_leaf',
                    'article_count' => count($articles),
                    'characters' => $totalCharacters,
                    'summary' => $summary,
                ],
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | LEAF CONDITION
        |--------------------------------------------------------------------------
        | Jika total karakter masih aman,
        | langsung proses tanpa melakukan divide.
        |--------------------------------------------------------------------------
        */
        if ($totalCharacters <= $maxCharacters) {

            $summary = $this->summarizeBatch($articles);

            return [
                'summary' => $summary,
                'trace' => [
                    'type' => 'leaf',
                    'article_count' => count($articles),
                    'characters' => $totalCharacters,
                    'summary' => $summary,
                ],
            ];
        }

        /*
        DIVIDE
        */
        [$leftArticles, $rightArticles]
            = $this->splitArticlesByCharacters(
                $articles,
                $maxCharacters
            );

        /*
        PROCESSING
        */
        $leftResult = $this->processArticles(
            $leftArticles,
            $maxCharacters
        );

        $rightResult = $this->processArticles(
            $rightArticles,
            $maxCharacters
        );

        /* MERGE */
        $summary = $this->mergeSummaries(
            $leftResult['summary'],
            $rightResult['summary']
        );

        return [
            'summary' => $summary,
            'trace' => [
                'type' => 'merge',
                'article_count' => count($articles),
                'characters' => $totalCharacters,
                'left' => $leftResult['trace'],
                'right' => $rightResult['trace'],
                'summary' => $summary,
            ],
        ];
    }

    private function calculateCharacters(
        array $articles
    ): int {

        $total = 0;

        foreach ($articles as $article) {

            $text = json_encode(
                $article,
                JSON_UNESCAPED_UNICODE
            );

            $total += strlen($text);
        }

        return $total;
    }

    private function splitArticlesByCharacters(
        array $articles,
        int $maxCharacters
    ): array {

        $left = [];
        $right = [];

        $currentCharacters = 0;

        foreach ($articles as $article) {

            $articleCharacters = strlen(
                json_encode(
                    $article,
                    JSON_UNESCAPED_UNICODE
                )
            );

            if (
                ($currentCharacters + $articleCharacters)
                <= $maxCharacters
            ) {

                $left[] = $article;

                $currentCharacters += $articleCharacters;

            } else {

                $right[] = $article;
            }
        }

        /*
        SAFETY FALLBACK: Jika right kosong, pindahkan 1 artikel dari left ke right.
         Mencegah infinite recursion jika ada artikel sangat besar.
        */

        if (empty($left) && !empty($right)) {

            $left[] = array_shift($right);
        }

        return [$left, $right];
    }

    private function summarizeBatch(
        array $articles
    ): array {

        $prompt = $this->buildBatchPrompt($articles);

        $output = $this->requestGemini($prompt);

        return $this->decodeJsonOutput(
            $output,
            $articles
        );
    }

    private function mergeSummaries(
        array $leftSummary,
        array $rightSummary
    ): array {

        $prompt = $this->buildMergePrompt(
            $leftSummary,
            $rightSummary
        );

        $output = $this->requestGemini($prompt);

        return $this->decodeJsonOutput(
            $output,
            [$leftSummary, $rightSummary]
        );
    }

    private function buildBatchPrompt(
        array $articles
    ): string {

        return "
Extract PRISMA-based information from this batch.

Return ONLY valid JSON.

Schema:
{
  \"introduction\": {
    \"rationale\": \"\",
    \"objective\": \"\"
  },
  \"results\": {
    \"individual_results\": \"\",
    \"synthesis_results\": \"\",
    \"risk_of_bias\": \"\"
  }
}

Instructions:
- Analyze all extraction data
- Combine relevant information
- Keep output concise
- Use null if information is unavailable

Batch extraction data:
" . json_encode(
            $articles,
            JSON_PRETTY_PRINT
            | JSON_UNESCAPED_UNICODE
        );
    }

    private function buildMergePrompt(
        array $leftSummary,
        array $rightSummary
    ): string {

        return "
Merge the following PRISMA summaries.

Return ONLY valid JSON.

Schema:
{
  \"introduction\": {
    \"rationale\": \"\",
    \"objective\": \"\"
  },
  \"results\": {
    \"individual_results\": \"\",
    \"synthesis_results\": \"\",
    \"risk_of_bias\": \"\"
  }
}

Instructions:
- Merge both summaries
- Remove duplicate information
- Keep the most complete information
- Maintain PRISMA structure

Left summary:
" . json_encode(
            $leftSummary,
            JSON_PRETTY_PRINT
            | JSON_UNESCAPED_UNICODE
        ) . "

Right summary:
" . json_encode(
            $rightSummary,
            JSON_PRETTY_PRINT
            | JSON_UNESCAPED_UNICODE
        );
    }

    private function requestGemini(
        string $prompt
    ): string {

        $response = Http::timeout(300)->post(
            'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key='
            . env('GEMINI_API_KEY'),
            [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $prompt
                            ],
                        ],
                    ],
                ],
            ]
        );

        $json = $response->json();

        return (string) data_get(
            $json,
            'candidates.0.content.parts.0.text',
            ''
        );
    }

    private function decodeJsonOutput(
        string $output,
        array $fallbackData
    ): array {

        $cleanOutput = str_replace(
            ['```json', '```'],
            '',
            $output
        );

        $cleanOutput = trim($cleanOutput);

        $parsed = json_decode(
            $cleanOutput,
            true
        );

        if (
            json_last_error() !== JSON_ERROR_NONE
            || !is_array($parsed)
        ) {

            return [
                'error' => 'Invalid JSON from AI',
                'raw_output' => $cleanOutput,
                'source_items' => count($fallbackData),
            ];
        }

        return $parsed;
    }
}