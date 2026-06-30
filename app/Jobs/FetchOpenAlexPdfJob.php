<?php

namespace App\Jobs;

use App\Models\FilteredArticle;
use App\Services\OpenAlexService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class FetchOpenAlexPdfJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [10, 30];

    public function __construct(protected int $filteredArticleId)
    {
        $this->onQueue('default');
    }

    /**
     * Execute the job.
     */
    public function handle(OpenAlexService $openAlexService): void
    {
        $filteredArticle = FilteredArticle::with('rawArticle')->find($this->filteredArticleId);

        if (! $filteredArticle) {
            Log::warning('[FetchOpenAlexPdfJob] FilteredArticle not found', [
                'filtered_article_id' => $this->filteredArticleId,
            ]);
            return;
        }

        // Skip if already retrieved
        if ($filteredArticle->pdf_path) {
            Log::info('[FetchOpenAlexPdfJob] Article already has a PDF, skipping', [
                'filtered_article_id' => $this->filteredArticleId,
            ]);
            return;
        }

        $doi = $filteredArticle->rawArticle?->doi;

        if (! $doi || $doi === '-') {
            Log::info('[FetchOpenAlexPdfJob] No DOI available for article, skipping', [
                'filtered_article_id' => $this->filteredArticleId,
            ]);
            return;
        }

        Log::info('[FetchOpenAlexPdfJob] Attempting to fetch PDF from OpenAlex', [
            'filtered_article_id' => $this->filteredArticleId,
            'doi'                 => $doi,
        ]);

        $localPath = $openAlexService->downloadPdf($doi);

        if ($localPath) {
            $filteredArticle->update([
                'pdf_path'  => $localPath,
                'retrieved' => true,
            ]);

            Log::info('[FetchOpenAlexPdfJob] PDF fetched and article updated', [
                'filtered_article_id' => $this->filteredArticleId,
                'pdf_path'            => $localPath,
            ]);
        } else {
            Log::info('[FetchOpenAlexPdfJob] No public PDF found for article', [
                'filtered_article_id' => $this->filteredArticleId,
                'doi'                 => $doi,
            ]);
        }
    }
}
