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
            'size.integer' => 'Jumlah data harus berupa angka.',
            'size.min'     => 'Jumlah data minimal 1.',
            'size.max'     => 'Jumlah data maksimal 100.',
            'sort.string'  => 'Urutan pengurutan harus berupa teks.',
            'sort.in'      => 'Nilai pengurutan hanya boleh "relevance".',
        ];
    }
}
