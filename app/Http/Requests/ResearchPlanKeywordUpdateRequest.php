<?php

namespace App\Http\Requests;

use Closure;
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
                ->map(function ($item) {
                    $item = mb_strtolower(trim($item));
                    
                    $item = preg_replace('/\s+/', ' ', $item);
                    
                    $item = preg_replace_callback('/\b(and|or|not)\b/i', function($matches) {
                        return strtoupper($matches[0]);
                    }, $item);

                    return $item;
                })
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
                function (string $attribute, mixed $value, Closure $fail) {
                    if (preg_match('/\s{2,}/', $value)) {
                        $fail('Kata kunci tidak boleh mengandung spasi lebih dari satu secara berurutan.');
                    }

                    if (preg_match('/\b(and|or|not)\b/', $value)) {
                        $fail('Operator logika (AND, OR, NOT) harus menggunakan huruf kapital.');
                    }
                    
                    $withoutOperators = preg_replace('/\b(AND|OR|NOT)\b/', '', $value);
                    if (preg_match('/[A-Z]/', $withoutOperators)) {
                        $fail('Kata kunci selain operator (AND, OR, NOT) harus menggunakan huruf kecil.');
                    }
                },
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
            'new_keyword.regex'       => 'Karakter tidak valid. Hanya huruf, angka, spasi tunggal, pemisah (;), dan awalan (!) yang diizinkan.',
            'old_keyword_id.required' => 'Sistem tidak dapat mengenali kata kunci mana yang ingin diubah. Silakan muat ulang halaman dan coba lagi.',
            'old_keyword_id.exists'   => 'Kata kunci yang ingin diubah sudah tidak ada atau mungkin telah dihapus. Silakan muat ulang halaman.',
        ];
    }
}