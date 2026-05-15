<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    public function process(Request $request)
    {
        // ambil data articles (array)
        $articles = $request->input('articles', []);

        if (empty($articles)) {
            return response()->json([
                "error" => "No articles provided"
            ], 400);
        }

        $results = [];

        foreach ($articles as $index => $article) {

            // ambil tiap field
            $abstract = $article['abstract'] ?? '';
            $introduction = $article['introduction'] ?? '';
            $res = $article['results'] ?? '';
            $conclusion = $article['conclusion'] ?? '';

            // PROMPT
            $prompt = "
                Extract PRISMA-based information.

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
                - Gunakan semua bagian teks yang tersedia
                - Jika tidak ditemukan, isi dengan null

                Abstract:
                $abstract

                Introduction:
                $introduction

                Results:
                $res

                Conclusion:
                $conclusion
                ";

            // GEMINI API
            $response = Http::post(
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" . env('GEMINI_API_KEY'),
                [
                    "contents" => [
                        [
                            "parts" => [
                                ["text" => $prompt]
                            ]
                        ]
                    ]
                ]
            );

            $json = $response->json();

            // get output text from AI
            $output = data_get($json, 'candidates.0.content.parts.0.text');

            $output = str_replace(['```json', '```'], '', $output);
            $output = trim($output);

            // decode JSON
            $parsed = json_decode($output, true);

            // handle gagal decode
            if (!$parsed) {
                $results[] = [
                    "article_index" => $index,
                    "error" => "Invalid JSON from AI",
                    "raw_output" => $output
                ];
                continue;
            }

            // simpan hasil
            $results[] = [
                "article_index" => $index,
                "data" => $parsed
            ];
        }

        return response()->json([
            "results" => $results
        ]);
    }
}