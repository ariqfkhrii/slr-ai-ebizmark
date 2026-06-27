<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAllPurificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'research_plan_id' => 'required|integer|exists:research_plans,research_plan_id',
            'included' => 'required|boolean',
        ];
    }
}