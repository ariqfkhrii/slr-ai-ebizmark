<?php

namespace App\Jobs;

use App\Models\Keyword;
use App\Services\Embedding\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateKeywordEmbeddingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $keywordId
    ) {}

    public function handle(EmbeddingService $embeddingService)
    {
        $keyword = Keyword::find($this->keywordId);

        if (!$keyword || $keyword->embedding) {
            return;
        }

        $embedding = $embeddingService->generate($keyword->keyword);

        $keyword->update([
            'embedding' => $embedding
        ]);
    }
}