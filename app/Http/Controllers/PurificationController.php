<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkUpdatePurificationRequest;
use App\Http\Requests\GetPurificationRequest;
use App\Http\Requests\UpdateAllPurificationRequest;
use App\Http\Requests\UpdatePurificationRequest;
use App\Services\FilteredArticleService;

class PurificationController extends Controller
{
    protected FilteredArticleService $filteredArticleService;

    public function __construct(FilteredArticleService $filteredArticleService)
    {
        $this->filteredArticleService = $filteredArticleService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(GetPurificationRequest $request, int $planId)
    {
        $size = $request->validated('size', 10);

        $sort = $request->validated('sort');

        $paginatedData = $this->filteredArticleService->getPaginatedArticles($planId, null, $size, $sort);

        $paginatedData->through(function ($filteredArticle) {
            return [
                'filtered_article_id' => $filteredArticle->id, 
                'included'            => $filteredArticle->included,
                'similarity_score'    => $filteredArticle->similarity_score,
                'raw_article'         => $filteredArticle->rawArticle, 
            ];
        });

        return response()->json($paginatedData);
    }

    public function calculateRelevance(int $planId)
    {
        $batchId = $this->filteredArticleService->dispatchRelevanceCalculation($planId);

        return response()->json([
            'message' => 'Proses perhitungan dimulai',
            'batch_id' => $batchId
        ]);
    }

    public function getAll(int $planId)
    {
        $articles = $this->filteredArticleService->getAllArticles($planId);

        $data = $articles->map(function ($filteredArticle) {
            return [
                'filtered_article_id' => $filteredArticle->id,
                'included' => $filteredArticle->included,
                'raw_article' => $filteredArticle->rawArticle,
            ];
        });

        return response()->json($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurificationRequest $request)
    {
        $id = $request->validated('filtered_article_id');
        $included = $request->validated('included');

        $this->filteredArticleService->updateIncludedStatus($id, $included);

        return response()->json([
            'message' => 'Status included berhasil diupdate.'
        ]);
    }

    public function updateAll(UpdateAllPurificationRequest $request)
    {
        $researchPlanId = $request->validated('research_plan_id');
        $included = $request->validated('included');

        $this->filteredArticleService->updateAllIncludedStatus(
            $researchPlanId,
            $included
        );

        return response()->json([
            'message' => 'Status included seluruh artikel berhasil diupdate.'
        ]);
    }

    public function bulkUpdate(BulkUpdatePurificationRequest $request)
    {
        $articleIds = $request->validated('article_ids');
        $included = $request->validated('included');

        $this->filteredArticleService->bulkUpdateIncludedStatus(
            $articleIds,
            $included
        );

        return response()->json([
            'message' => 'Status artikel berhasil diperbarui.'
        ]);
    }
}
