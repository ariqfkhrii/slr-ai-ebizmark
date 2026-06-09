<?php

namespace App\Http\Controllers;

use App\Services\AiExtractionService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AiExtractionController extends Controller
{
    public function __construct(
        protected AiExtractionService $service
    ) {
    }

    public function run(Request $request)
    {
        $validated = $request->validate([
            'research_plan_id' => [
                'required',
                'integer',
                Rule::exists('research_plans', 'research_plan_id'),
            ],
        ]);

        $result = $this->service->run(
            (int) $validated['research_plan_id'],
            (int) $request->user()->id,
        );

        return response()->json([
            'processed' => $result['processed'],
            'total' => $result['total'],
            'results' => $result['results'],
        ]);
    }
}
