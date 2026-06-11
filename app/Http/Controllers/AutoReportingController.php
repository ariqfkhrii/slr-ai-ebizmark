<?php

namespace App\Http\Controllers;

use App\Models\AutoReporting;
use App\Services\AutoReportingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AutoReportingController extends Controller
{
    public function __construct(protected AutoReportingService $service)
    {
    }

    public function index(int $researchPlanId)
    {
        $items = $this->service->listItems($researchPlanId);
        $researchPlan = \App\Models\ResearchPlan::find($researchPlanId);
        $filteredArticles = $researchPlan?->filteredArticles()->where('article_status', 'included')->get() ?? [];

        return Inertia::render('prisma/auto-reporting/index', [
            'researchPlanId' => $researchPlanId,
            'researchPlan' => $researchPlan,
            'items' => $items,
            'filteredArticles' => $filteredArticles,
        ]);
    }

    public function generate(AutoReporting $autoReporting)
    {
        try {
            $item = $this->service->generate($autoReporting->id);
            $allItems = $this->service->listItems($autoReporting->research_plan_id);

            return response()->json([
                'item' => $item,
                'items' => $allItems,
                'success' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('AutoReporting generate error', [
                'autoReporting_id' => $autoReporting->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Gagal generate AI content: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, AutoReporting $autoReporting)
    {
        try {
            $validated = $request->validate([
                'generated_content' => ['nullable', 'string'],
            ]);

            $item = $this->service->update($autoReporting->id, $validated['generated_content'] ?? null);
            $allItems = $this->service->listItems($autoReporting->research_plan_id);

            return response()->json([
                'item' => $item,
                'items' => $allItems,
                'success' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('AutoReporting update error', [
                'autoReporting_id' => $autoReporting->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Gagal update content: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function regenerate(AutoReporting $autoReporting)
    {
        try {
            $item = $this->service->regenerate($autoReporting->id);
            $allItems = $this->service->listItems($autoReporting->research_plan_id);

            return response()->json([
                'item' => $item,
                'items' => $allItems,
                'success' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('AutoReporting regenerate error', [
                'autoReporting_id' => $autoReporting->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Gagal regenerate content: ' . $e->getMessage(),
            ], 500);
        }
    }
}
