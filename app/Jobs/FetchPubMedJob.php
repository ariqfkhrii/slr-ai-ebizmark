<?php

namespace App\Jobs;

use App\Services\PubMedIngestService;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class FetchPubMedJob implements ShouldQueue
{
    use Queueable;
    use Batchable;

    public int $tries = 5;
    public array $backoff = [1, 2, 3, 5];

    protected array $validatedRequest;
    protected int $page;
    protected string $cacheKey;

    public function __construct(array $validatedRequest, int $page, string $cacheKey)
    {
        $this->validatedRequest = $validatedRequest;
        $this->page = $page;
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
                $this->page,
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
            $message = $e->getMessage();

            if (in_array($message, ['API_RATE_LIMIT', 'SERVER_ERROR'])) {
                $delay = $message === 'API_RATE_LIMIT' ? 15 : 30;
                $this->release($delay); 
                return;
            }

            if (in_array($message, ['AUTH_ERROR', 'BAD_REQUEST'])) {
                Log::critical(
                    "PubMed batch job was forcefully cancelled due to: {$message}. Batch ID: " . $this->batch()?->id
                );
                
                $this->batch()?->cancel();
                
                return; 
            }
            
            throw $e; 
        }
    }
}