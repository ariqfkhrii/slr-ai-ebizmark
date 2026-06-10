<?php

namespace App\Http\Controllers;

use App\Services\ExtractionService;
use Illuminate\Http\Request;

class ExtractionController extends Controller
{
    public function __construct(
        protected ExtractionService $service
    ) {}

    /**
     * Upsert manual extraction result for a filtered article.
     */
    public function update(Request $request, int $filteredArticleId)
    {
        $validated = $request->validate([
            'abstract'       => ['nullable', 'string'],
            'introduction'   => ['nullable', 'string'],
            'result'         => ['nullable', 'string'],
            'conclusion'     => ['nullable', 'string'],
            'recommendation' => ['nullable', 'string'],
            'novelty_gap'    => ['nullable', 'string'],
            'future_research'=> ['nullable', 'string'],
            'limitation'     => ['nullable', 'string'],
        ]);

        $this->service->upsert(
            $filteredArticleId,
            (int) $request->user()->id,
            $validated
        );

        return redirect()->back()->with('success', 'Extraction saved.');
    }
}
