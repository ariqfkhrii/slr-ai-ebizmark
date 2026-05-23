<?php

namespace App\Http\Requests\ResearchPlanKeyword;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ResearchPlanKeywordUpdateRequest extends FormRequest
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
            'new_keyword' => 'required|string|max:255',
            'old_keyword_id' => 'required|exists:keywords,id',
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
            'new_keyword.required' => 'The new keyword field is required.',
            'new_keyword.string' => 'The new keyword must be a string.',
            'new_keyword.max' => 'The new keyword may not be greater than 255 characters.',
            'old_keyword_id.required' => 'The old keyword ID field is required.',
            'old_keyword_id.exists' => 'The old keyword ID does not exist.',
        ];
    }
}
