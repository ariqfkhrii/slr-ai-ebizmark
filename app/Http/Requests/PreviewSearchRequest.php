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
            'keyword_id.required' => 'Pilih salah satu kata kunci.',
            'keyword_id.exists' => 'Kata kunci yang dipilih tidak tersedia.',
            'start_year.required' => 'Masukkan tahun awal pencarian.',
            'start_year.integer' => 'Tahun awal pencarian harus berupa angka.',
            'start_year.min' => 'Tahun awal pencarian minimal 1900.',
            'start_year.max' => 'Tahun awal pencarian tidak boleh melebihi tahun saat ini.',
            'end_year.required' => 'Masukkan tahun akhir pencarian.',
            'end_year.integer' => 'Tahun akhir pencarian harus berupa angka.',
            'end_year.min' => 'Tahun akhir pencarian minimal 1900.',
            'end_year.max' => 'Tahun akhir pencarian tidak boleh melebihi tahun saat ini.',
            'end_year.gte' => 'Tahun akhir pencarian harus sama dengan atau setelah tahun awal pencarian.',
        ];
    }
}
