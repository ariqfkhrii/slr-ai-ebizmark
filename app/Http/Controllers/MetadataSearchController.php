<?php

namespace App\Http\Controllers;

use App\Http\Requests\MetadataSearchRequest;
use App\Http\Requests\PreviewSearchRequest;
use App\Services\MetadataSearchServices;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MetadataSearchController extends Controller
{
    protected MetadataSearchServices $service;
    
    public function __construct(MetadataSearchServices $service)
    {
        $this->service = $service;
    }
    
    /**
     * Handle the preview search request and return appropriate response.
     *
     * @param PreviewSearchRequest $request
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPreview(PreviewSearchRequest $request, $id)
    {
        try {
            $validated = $request->validated();
            
            $previewResult = $this->service->getPreviewResults($validated, $id);
            $totalCount = $previewResult['total_count'];
            
            if ($previewResult['is_recommended']) {
                $message = 'Preview search results retrieved successfully.';
            } elseif ($totalCount < 100) {
                $message = "The number of articles found is too low ({$totalCount}). Minimum required is 100. Proceeding further is not allowed.";
            } else {
                $message = "The number of articles found exceeds 5,000 ({$totalCount}). This is the limit. Proceeding further is not allowed.";
            }

            return response()->json([
                'message'     => $message,
                'can_execute' => $previewResult['is_recommended'],
                'data'        => $previewResult
            ], 200);

        } catch (\Exception $e) {
            Log::error('Preview Search Error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to retrieve preview results. Please try again later.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal Server Error'
            ], 500);
        }
    }

    /**
     * Handle the metadata search request and return appropriate response.
     *
     * @param MetadataSearchRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function dispatchResult(MetadataSearchRequest $request, $id)
    {
        $validated = $request->validated();

        $result = $this->service->executeSearch($validated, $id);

        return match ($result['status']) {
            'full_cache' => response()->json([
                'message' => 'All sources found in cache.',
            ], $result['code']),

            'active_running' => response()->json([
                'message' => 'An active search plan is already running for this keyword.',
                'batch_id' => $result['batch_id'] ?? null,
            ], $result['code']),

            'no_results' => response()->json([
                'message' => 'No results found on the external databases for this keyword.',
            ], $result['code']),

            'dispatched' => response()->json([
                'message' => 'Search initiated successfully.',
                'batch_id' => $result['batch_id'] ?? null,
                'missed_sources' => $result['missed_sources'] ?? [],
            ], $result['code']),

            default => response()->json([
                'message' => 'Unknown metadata search status.',
                'status' => $result['status'] ?? null,
            ], 500),
        };
    }

    /**
     * Handle the request to cancel an ongoing search batch.
     *
     * @param string $batchId
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelSearch(string $batchId)
    {
        $batch = Bus::findBatch($batchId);

        if (! $batch) {
            return response()->json(['message' => 'Batch not found.'], 404);
        }

        if ($batch->finished()) {
            return response()->json(['message' => 'Cannot cancel a completed batch.'], 400);
        }
        
        $batch->cancel();

        return response()->json([
            'message' => 'Search job cancelled successfully.',
            'batch_id' => $batch->id
        ], 200);
    }

    public function batchProgress(string $batchId)
    {
        $batch = DB::table('job_batches')
            ->where('id', $batchId)
            ->first();

        if (! $batch) {
            return response()->json([
                'message' => 'Batch not found.',
            ], 404);
        }

        $totalJobs = (int) $batch->total_jobs;
        $pendingJobs = (int) $batch->pending_jobs;
        $failedJobs = (int) $batch->failed_jobs;

        $processedJobs = max($totalJobs - $pendingJobs, 0);

        $percentage = $totalJobs > 0
            ? round(($processedJobs / $totalJobs) * 100)
            : 0;

        $status = 'running';

        if ($batch->cancelled_at !== null) {
            $status = 'cancelled';
        } elseif ($batch->finished_at !== null) {
            $status = $failedJobs > 0 ? 'completed_with_errors' : 'completed';
        }

        return response()->json([
            'batch_id' => $batch->id,
            'name' => $batch->name,
            'status' => $status,
            'total_jobs' => $totalJobs,
            'pending_jobs' => $pendingJobs,
            'processed_jobs' => $processedJobs,
            'failed_jobs' => $failedJobs,
            'percentage' => $percentage,
        ]);
    }
}
