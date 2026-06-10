<?php

namespace App\Jobs;

use App\Services\PubMedIngestService;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Queue\Queueable;

class FetchPubMedJob implements ShouldQueue
{
    use Queueable;
    use Batchable;

    public int $tries = 5;
    public array $backoff = [1, 2, 3, 5];

    protected array $validatedRequest;
    protected int $startPage;
    protected int $endPage;
    protected string $cacheKey;

    public function __construct(array $validatedRequest, int $startPage, int $endPage, string $cacheKey)
    {
        $this->validatedRequest = $validatedRequest;
        $this->startPage = $startPage;
        $this->endPage = $endPage;
        $this->cacheKey = $cacheKey;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(PubMedIngestService $service): void
    {
        if ($this->batch()?->cancelled()) {
            return;
        }
        
        try {
            $service->ingest(
                $this->validatedRequest,
                $this->startPage,
                $this->endPage,
                $this->batch()?->id,
                $this->cacheKey
            );
        } catch (QueryException $e) {
            if ($e->errorInfo[1] === 1213) {
                $this->release(rand(1, 3));
                return;
            }
            throw $e;
        } catch (\Exception $e) {
            if ($e->getMessage() === 'API_RATE_LIMIT') {
                $this->release(15); 
                return;
            }
            
            throw $e; 
        }
    }
}
