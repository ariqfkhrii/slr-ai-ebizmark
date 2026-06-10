<?php

namespace App\Http\Controllers;

use App\Models\ClassificationSetup;
use App\Models\ResearchPlan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClassificationSetupController extends Controller
{
    public function upsert(Request $request)
    {
        $validated = $request->validate([
            'research_plan_id' => [
                'required',
                'integer',
                Rule::exists('research_plans', 'research_plan_id'),
            ],
            'category_1' => ['nullable', 'string', 'max:255'],
            'category_2' => ['nullable', 'string', 'max:255'],
            'category_3' => ['nullable', 'string', 'max:255'],
            'category_4' => ['nullable', 'string', 'max:255'],
            'category_5' => ['nullable', 'string', 'max:255'],
            'category_6' => ['nullable', 'string', 'max:255'],
            'theory' => ['nullable', 'string'],
        ]);

        $researchPlan = ResearchPlan::query()
            ->where('research_plan_id', $validated['research_plan_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $researchPlan) {
            abort(403);
        }

        ClassificationSetup::query()->updateOrCreate(
            ['research_plan_id' => $researchPlan->research_plan_id],
            [
                'category_1' => $validated['category_1'] ?? null,
                'category_2' => $validated['category_2'] ?? null,
                'category_3' => $validated['category_3'] ?? null,
                'category_4' => $validated['category_4'] ?? null,
                'category_5' => $validated['category_5'] ?? null,
                'category_6' => $validated['category_6'] ?? null,
                'theory' => $validated['theory'] ?? null,
            ],
        );

        return redirect()->back()->with('success', 'Classification setup saved.');
    }
}
