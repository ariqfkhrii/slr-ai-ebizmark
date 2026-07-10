<?php

namespace App\Jobs;

use App\Models\Keyword;
use App\Services\Embedding\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\Query\QueryPreprocessingService;

class GenerateKeywordEmbeddingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $keywordId
    ) {
        $this->onQueue('keyword');
    }

    public function handle(
        EmbeddingService $embeddingService,
        QueryPreprocessingService $queryPreprocessingService
    ): void
    {
        $keyword = Keyword::find($this->keywordId);

        if (!$keyword) {
            return;
        }

        $cleanQuery = $queryPreprocessingService->clean(
            $keyword->keyword
        );

        $embedding = $embeddingService->generate(
            $cleanQuery
        );

        $keyword->update([
            'embedding' => $embedding
        ]);
    }
}