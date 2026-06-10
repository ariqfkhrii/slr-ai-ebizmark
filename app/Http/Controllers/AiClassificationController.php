<?php

namespace App\Http\Controllers;

use App\Services\AiClassificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AiClassificationController extends Controller
{
    public function __construct(
        protected AiClassificationService $service
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

        if (isset($result['error'])) {
            return $result['error'];
        }

        return response()->json([
            'processed' => $result['processed'],
            'total' => $result['total'],
            'results' => $result['results'],
        ]);
    }
}
