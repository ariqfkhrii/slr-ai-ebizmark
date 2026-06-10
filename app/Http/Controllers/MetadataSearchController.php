<?php

namespace App\Http\Controllers;

use App\Http\Requests\PreviewSearchRequest;
use App\Services\MetadataSearchServices;
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
            
            $previewResult = $this->service->getPreviewResults($id, $validated);
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
}
