<?php

namespace App\Http\Controllers;

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

        return Inertia::render('Dashboard', [
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
}
