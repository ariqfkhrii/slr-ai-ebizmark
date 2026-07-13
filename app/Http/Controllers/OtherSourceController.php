<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOtherSourceRequest;
use App\Models\ResearchPlan;
use App\Services\OtherSourceIngestService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class OtherSourceController extends Controller
{
    public function __construct(
        protected OtherSourceIngestService $service
    ) {
    }

    public function index(ResearchPlan $researchPlan)
    {
        return Inertia::render('upload-other-source/page', [
            'researchPlanId' => $researchPlan->research_plan_id,
        ]);
    }

    public function store(
        StoreOtherSourceRequest $request,
        ResearchPlan $researchPlan
    ): JsonResponse {
        $result = $this->service->store(
            $researchPlan,
            $request->validated()
        );

        return response()->json($result, 201);
    }

    public function keywords(ResearchPlan $researchPlan)
    {
        $researchPlan->load([
            'keywords:id,keyword',
        ]);

        return response()->json(
            $researchPlan->keywords
                ->map(fn ($keyword) => [
                    'id' => $keyword->id,
                    'keyword' => $keyword->keyword,
                ])
                ->values()
        );
    }
}