<?php

namespace App\Services\Embedding;

use Illuminate\Support\Facades\Http;

class EmbeddingService
{
    public function generate(string $text): array
    {
        $response = Http::timeout(10)->post(
            config('services.embedding.url'),
            [
                'text' => $text
            ]
        );

        return $response->json('embedding') ?? [];
    }

    /**
     * Generate embeddings for a batch of texts in API call.
     *
     * @param array $texts List of text strings to embed.
     * @return array List of embedding vectors in the same order as the input texts.
     */
    public function generateBatch(array $texts): array
    {
        $response = Http::timeout(60)->post(
            config('services.embedding.url'),
            [
                'text' => $texts,
            ]
        );

        // Python returns {"embedding": [[...], [...]]} when text is a list
        return $response->json('embedding') ?? [];
    }
}