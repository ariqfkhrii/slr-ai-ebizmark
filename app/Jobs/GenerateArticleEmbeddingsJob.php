<?php

namespace App\Jobs;

use App\Models\RawArticle;
use App\Services\Embedding\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateArticleEmbeddingsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param array $articleIds Array of RawArticle IDs to generate embeddings for.
     */
    public function __construct(
        public array $articleIds
    ) {}

    /**
     * Execute the job.
     *
     * Fetches the given articles, concatenates title and abstract as the text
     * to embed, calls the batch embedding API, and saves each embedding back
     * to the corresponding row in raw_articles.
     */
    public function handle(EmbeddingService $embeddingService): void
    {
        $articles = RawArticle::whereIn('id', $this->articleIds)
            ->whereNull('embedding')
            ->get(['id', 'title', 'abstract']);

        if ($articles->isEmpty()) {
            return;
        }

        // Build an ordered list of texts, keeping track of article IDs in the same order
        $orderedIds = [];
        $texts = [];

        foreach ($articles as $article) {
            $text = trim(($article->title ?? '') . ' ' . ($article->abstract ?? ''));

            if ($text === '') {
                continue;
            }

            $orderedIds[] = $article->id;
            $texts[] = $text;
        }

        if (empty($texts)) {
            return;
        }

        $embeddings = $embeddingService->generateBatch($texts);

        // Persist each embedding; zip by positional index
        foreach ($orderedIds as $index => $id) {
            if (!isset($embeddings[$index])) {
                continue;
            }

            RawArticle::where('id', $id)->update([
                'embedding' => $embeddings[$index],
            ]);
        }
    }
}
