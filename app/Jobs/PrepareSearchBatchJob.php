<?php

namespace App\Jobs;

use App\Models\Keyword;
use App\Services\PubMedApiService;
use App\Services\ScopusApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;

class PrepareSearchBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $batchId;
    public array $validatedRequest;
    public string $source;
    public string $cacheKey;
    public string|int $planId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(string $batchId, array $validatedRequest, string $source, string $cacheKey, $planId)
    {
        $this->batchId = $batchId;
        $this->validatedRequest = $validatedRequest;
        $this->source = $source;
        $this->cacheKey = $cacheKey;
        $this->planId = $planId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(ScopusApiService $scopusApi, PubMedApiService $pubmedApi)
    {
        $batch = Bus::findBatch($this->batchId);
        
        if (!$batch || $batch->canceled()) {
            return;
        }

        $keywordId = $this->validatedRequest['keyword_id'];
        $keywordModel = Keyword::find($keywordId);
        
        if (!$keywordModel) {
            $batch->cancel();
            return;
        }

        $keywordString = $keywordModel->keyword;
        $startYear = $this->validatedRequest['start_year'];
        $endYear   = $this->validatedRequest['end_year'];

        $itemsPerPage = 0;
        $totalCount   = 0;

        if ($this->source === 'scopus') {
            $itemsPerPage = 25;
            $totalCount = $scopusApi->getTotalCount($keywordString, $startYear, $endYear);
            $totalCount = min($totalCount, 5000);
        } elseif ($this->source === 'pubmed') {
            $itemsPerPage = 175;
            $totalCount = $pubmedApi->getTotalCount($keywordString, $startYear, $endYear);
            $totalCount = min($totalCount, 5000);
        }

        if ($totalCount === 0) {
            $batch->cancel();
            return;
        }

        $totalPages = (int) ceil($totalCount / $itemsPerPage);
        $jobsToAppend = [];

        for ($page = 1; $page <= $totalPages; $page++) {
            if ($this->source === 'scopus') {
                $jobsToAppend[] = new FetchScopusJob($this->validatedRequest, $page, $this->cacheKey);
            } elseif ($this->source === 'pubmed') {
                $jobsToAppend[] = new FetchPubMedJob($this->validatedRequest, $page, $this->cacheKey);
            }
        }

        if (!empty($jobsToAppend)) {
            $batch->add($jobsToAppend);
        }
    }
}
