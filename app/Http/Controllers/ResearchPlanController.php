<?php

namespace App\Http\Controllers;

use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResearchPlanController extends Controller
{
    public function index(Request $request)
    {
        $researchPlans = $request->user()
            ->researchPlans()
            ->latest()
            ->get();

        return Inertia::render('dashboard', [
            'researchPlans' => $researchPlans,
            'auth' => [
                'user' => $request->user()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->user()
            ->researchPlans()
            ->create([
                'title' => $request->title,
            ]);

        return redirect()->back()->with('success', 'Research Plan berhasil dibuat');
    }

    /**
     * Display the specified resource.
     */
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

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ResearchPlan $researchPlan)
    {
        if ($researchPlan->user_id !== $request->user()->id) {
            abort(403);
        }

        $researchPlan->update([
            'title' => $request->title,
        ]);

        return redirect()->back()->with('success', 'Research Plan berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ResearchPlan $researchPlan)
    {
        if ($researchPlan->user_id !== $request->user()->id) {
            abort(403);
        }

        $researchPlan->delete();

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
            abort(404);
        }

        $filteredArticles = FilteredArticle::query()
            ->where('research_plan_id', $researchPlan->research_plan_id)
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
