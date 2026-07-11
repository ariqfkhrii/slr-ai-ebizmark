<?php

namespace App\Http\Requests\ResearchPlanKeyword;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ResearchPlanKeywordStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('keyword')) {
            $normalizedKeyword = preg_replace('/\bAND NOT\b/i', 'NOT', $this->keyword);
            
            $this->merge([
                'keyword' => trim($normalizedKeyword),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'keyword' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\p{L}0-9\s\*\?\"\'\{\}\-\/\(\)\\\\\.,:\[\]\~]+$/u',
                
                function ($attribute, $value, $fail) {
                    if (preg_match('/\bOR\b/i', $value) || str_contains($value, '|')) {
                        $fail('Operator OR (maupun simbol |) tidak didukung dalam satu pencarian demi keamanan limit data. Harap pecah menjadi beberapa kata kunci.');
                    }
                },
            ],
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
            'keyword.required' => 'Kata kunci wajib diisi.',
            'keyword.string'   => 'Kata kunci harus berupa format teks.',
            'keyword.max'      => 'Kata kunci maksimal 255 karakter.',
            'keyword.regex'    => 'Karakter tidak valid. Hanya huruf, angka, dan operator (* ? " \' { } [ ] - / ( ) ~) yang diizinkan.',
        ];
    }
}
