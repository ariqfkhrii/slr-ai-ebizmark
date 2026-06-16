<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetPurificationRequest;
use App\Services\FilteredArticleService;
use Illuminate\Http\Request;

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

        $paginatedData = $this->filteredArticleService->getPaginatedArticles($planId, null, $size);

        $paginatedData->through(function ($filteredArticle) {
            return [
                'filtered_article_id' => $filteredArticle->id, 
                'included'            => $filteredArticle->included,
                'raw_article'         => $filteredArticle->rawArticle, 
            ];
        });

        return response()->json($paginatedData);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }
}
