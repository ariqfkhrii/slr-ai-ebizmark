<?php

namespace App\Http\Controllers;

use App\Services\ClassificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClassificationController extends Controller
{
    protected ClassificationService $service;

    public function __construct(ClassificationService $service)
    {
        $this->service = $service;
    }

    /**
     * Upsert classification setup.
     */
    public function upsertSetup(Request $request)
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

        $this->service->upsertSetup(
            (int) $validated['research_plan_id'],
            $request->user()->id,
            $validated
        );

        return redirect()->back()->with('success', 'Classification setup saved.');
    }

    /**
     * Update individual article classification.
     */
    public function updateArticleClassification(Request $request, $filteredArticleId)
    {
        $validated = $request->validate([
            'research_method' => ['nullable', 'string', 'max:255'],
            'category_1' => ['nullable', 'string'],
            'category_2' => ['nullable', 'string'],
            'category_3' => ['nullable', 'string'],
            'category_4' => ['nullable', 'string'],
            'category_5' => ['nullable', 'string'],
            'category_6' => ['nullable', 'string'],
        ]);

        $this->service->updateClassification(
            (int) $filteredArticleId,
            $request->user()->id,
            $validated
        );

        return redirect()->back()->with('success', 'Classification saved.');
    }
}
