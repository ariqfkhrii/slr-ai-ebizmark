<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GetFilteredArticlesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'research_plan_id' => 'required|integer',
            'keyword_id'       => 'required|integer',
            'size'             => 'nullable|integer|min:1|max:100',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'research_plan_id.required' => 'The research plan ID is required.',
            'research_plan_id.integer'  => 'The research plan ID must be an integer.',
            'keyword_id.required'       => 'The keyword ID is required.',
            'keyword_id.integer'        => 'The keyword ID must be an integer.',
            'size.integer'              => 'The size must be an integer.',
            'size.min'                  => 'The size must be at least 1.',
            'size.max'                  => 'The size must not exceed 100.',
        ];
    }
}
