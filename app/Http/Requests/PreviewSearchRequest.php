<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PreviewSearchRequest extends FormRequest
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
            'keyword_id' => 'required|exists:keywords,id',
            'start_year' => 'required|integer|min:1900|max:'.date('Y'),
            'end_year' => 'required|integer|min:1900|max:'.date('Y').'|gte:start_year',
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
            'keyword_id.required' => 'The keyword_id field is required.',
            'keyword_id.exists' => 'The selected keyword_id is invalid.',
            'start_year.required' => 'The start_year field is required.',
            'start_year.integer' => 'The start_year must be an integer.',
            'start_year.min' => 'The start_year must be at least 1900.',
            'start_year.max' => 'The start_year may not be greater than the current year.',
            'end_year.required' => 'The end_year field is required.',
            'end_year.integer' => 'The end_year must be an integer.',
            'end_year.min' => 'The end_year must be at least 1900.',
            'end_year.max' => 'The end_year may not be greater than the current year.',
            'end_year.gte' => 'The end_year must be greater than or equal to the start_year.',
        ];
    }
}
