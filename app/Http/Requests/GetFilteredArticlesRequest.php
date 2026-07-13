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
            'keyword_id'       => 'nullable|integer',
            'size'             => 'nullable|integer|min:1|max:100',
            'search' => ['nullable', 'string'],
            'included' => ['nullable'],
            'year_from' => ['nullable', 'integer'],
            'year_to' => ['nullable', 'integer'],
            'tiers' => 'nullable|array',
            'tiers.*' => 'string|in:q1,q2,q3,q4',
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
            'research_plan_id.required' => 'ID rencana penelitian wajib diisi.',
            'research_plan_id.integer'  => 'ID rencana penelitian harus berupa angka.',
            'keyword_id.integer'        => 'ID kata kunci harus berupa angka.',
            'size.integer'              => 'Jumlah data harus berupa angka.',
            'size.min'                  => 'Jumlah data minimal 1.',
            'size.max'                  => 'Jumlah data maksimal 100.',
            'search.string'             => 'Kata pencarian harus berupa teks.',
            'included.boolean'          => 'Nilai status inklusi harus berupa benar atau salah.',
            'year_from.integer'         => 'Tahun awal harus berupa angka.',
            'year_to.integer'           => 'Tahun akhir harus berupa angka.',
            'tiers.array'               => 'Daftar kuartil harus berupa array.',
            'tiers.*.string'            => 'Setiap nilai kuartil harus berupa teks.',
            'tiers.*.in'                => 'Nilai kuartil hanya boleh q1, q2, q3, atau q4.',
        ];
    }
}
