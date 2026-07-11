<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GetPurificationRequest extends FormRequest
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
            'size' => 'nullable|integer|min:1|max:100',
            'sort' => 'nullable|string|in:relevance',
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
            'size.integer' => 'The size must be an integer.',
            'size.min' => 'The size must be at least 1.',
            'size.max' => 'The size may not be greater than 100.',
            'sort.string' => 'The sort must be a string.',
            'sort.in' => 'The sort must be one of the following: relevance.',
        ];
    }
}
