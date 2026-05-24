<?php

namespace App\Http\Controllers;

use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Interfaces\ResearchPlanServiceInterface;
// Import file request baru kita
use App\Http\Requests\StoreResearchPlanRequest; 

class ResearchPlanController extends Controller
{
    protected ResearchPlanServiceInterface $service;

    public function __construct(ResearchPlanServiceInterface $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $researchPlans = $this->service->listForUser($request->user());

        return Inertia::render('dashboard', [
            'researchPlans' => $researchPlans,
            'auth' => [
                'user' => $request->user()
            ]
        ]);
    }

    // Menggunakan FormRequest untuk validasi
    public function store(StoreResearchPlanRequest $request)
    {
        // $request->validated() hanya akan mengambil data yang sudah divalidasi di file request
        $this->service->createForUser($request->user(), $request->validated());

        return redirect()->back()->with('success', 'Research Plan berhasil dibuat');
    }

    public function show(ResearchPlan $researchPlan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ResearchPlan $researchPlan)
    {
        //
    }

    // Menggunakan FormRequest juga untuk update
    public function update(StoreResearchPlanRequest $request, ResearchPlan $researchPlan)
    {
        $this->service->update($researchPlan, $request->user(), $request->validated());

        return redirect()->back()->with('success', 'Research Plan berhasil diupdate');
    }

    public function destroy(Request $request, ResearchPlan $researchPlan)
    {
        $this->service->delete($researchPlan, $request->user());

        return redirect()->back()->with('success', 'Research Plan berhasil dihapus');
    }

    public function prisma(Request $request)
    {
        $researchPlans = $request->user()
            ->researchPlans()
            ->latest()
            ->get(['research_plan_id', 'title']);

        $selectedId = (int) $request->query('research_plan_id', $researchPlans->first()?->research_plan_id);
        $researchPlan = $researchPlans->firstWhere('research_plan_id', $selectedId);

        if (! $researchPlan) {
            $exists = ResearchPlan::query()
                ->where('research_plan_id', $selectedId)
                ->exists();

            if ($exists) {
                return Inertia::render('errors/forbidden-research-plan', [
                    'requestedId' => $selectedId,
                ]);
            }

            abort(404);
        }

        $filteredArticles = FilteredArticle::query()
            ->where('research_plan_id', $researchPlan->research_plan_id)
            ->where('article_status', 'included')
            ->with(['rawArticle:article_id,doi,title,issn,publish_year,tier'])
            ->get([
                'filtered_article_id',
                'raw_article_id',
                'research_plan_id',
                'novelty_status',
                'article_status',
                'included',
                'retrieved',
            ]);

        return Inertia::render('prisma/index', [
            'researchPlan' => $researchPlan,
            'researchPlans' => $researchPlans,
            'filteredArticles' => $filteredArticles,
        ]);
    }
}
