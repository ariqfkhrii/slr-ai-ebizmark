<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResearchPlanKeyword\ResearchPlanKeywordStoreRequest;
use App\Http\Requests\ResearchPlanKeyword\ResearchPlanKeywordUpdateRequest;
use App\Services\ResearchPlanKeyword\ResearchPlanKeywordService;

class ResearchPlanKeywordController extends Controller
{
    protected ResearchPlanKeywordService $service;

    /**
     * Dependency Injection of the ResearchPlanKeywordService
     */
    public function __construct(ResearchPlanKeywordService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(int $researchPlanId)
    {
        $userId = auth()->id();

        $keywords = $this->service->getKeywordsByResearchPlan($userId, $researchPlanId);

        return response()->json($keywords);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ResearchPlanKeywordStoreRequest $request, int $researchPlanId)
    {
        $userId = auth()->id();
        $keywordName = $request->validated()['keyword'];

        $keyword = $this->service->attachKeywordToResearchPlan($userId, $researchPlanId, $keywordName);

        return response()->json($keyword, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ResearchPlanKeywordUpdateRequest $request, int $researchPlanId)
    {
        $userId = auth()->id();
        $newKeywordName = $request->validated()['new_keyword'];
        $oldKeywordId = $request->validated()['old_keyword_id'];

        $newKeyword = $this->service->updateKeywordForResearchPlan(
            $userId, 
            $researchPlanId, 
            $oldKeywordId, 
            $newKeywordName
        );

        return response()->json($newKeyword);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $researchPlanId, int $keywordId)
    {
        $userId = auth()->id();

        $this->service->detachKeywordFromResearchPlan($userId, $researchPlanId, $keywordId);

        return response()->json(null, 204);
    }
}
