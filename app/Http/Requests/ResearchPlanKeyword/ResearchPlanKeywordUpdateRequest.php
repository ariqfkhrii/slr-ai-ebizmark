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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('new_keyword')) {
            $cleanedKeyword = collect(explode(';', $this->new_keyword))
                ->map(fn($item) => trim($item))
                ->implode(';');
            
            $this->merge([
                'new_keyword' => $cleanedKeyword,
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
            'new_keyword' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\p{L}0-9\s;!]+$/u',
            ],
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
            'new_keyword.required'    => 'Kata kunci baru wajib diisi.',
            'new_keyword.string'      => 'Kata kunci baru harus berupa format teks.',
            'new_keyword.max'         => 'Kata kunci baru maksimal 255 karakter.',
            'new_keyword.regex'       => 'Karakter tidak valid. Hanya huruf, angka, spasi, pemisah (;), dan awalan (!) yang diizinkan.',
            'old_keyword_id.required' => 'Sistem tidak dapat mengenali kata kunci mana yang ingin diubah. Silakan muat ulang halaman dan coba lagi.',
            'old_keyword_id.exists'   => 'Kata kunci yang ingin diubah sudah tidak ada atau mungkin telah dihapus. Silakan muat ulang halaman.',
        ];
    }
}
