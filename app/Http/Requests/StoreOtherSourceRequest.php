<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOtherSourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pdf' => [
                'required',
                'file',
                'mimes:pdf',
                'max:51200',
            ],

            'research_plan_keyword_id' => [
                'required',
                'integer',
                'exists:keywords,id',
            ],

            'doi' => [
                'nullable',
                'string',
                'max:255',
            ],

            'title' => [
                'required',
                'string',
                'max:1000',
            ],

            'authors' => [
                'nullable',
                'string',
            ],

            'tier' => [
                'nullable',
                'in:q1,q2,q3,q4',
            ],

            'article_keyword' => [
                'nullable',
                'string',
            ],

            'abstract' => [
                'nullable',
                'string',
            ],

            'citation_count' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'publish_year' => [
                'nullable',
                'integer',
                'digits:4',
                'min:1900',
                'max:' . date('Y'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'pdf.required' => 'PDF wajib diunggah.',
            'pdf.mimes' => 'File harus berupa PDF.',
            'pdf.max' => 'Ukuran PDF maksimal 50 MB.',

            'title.required' => 'Judul artikel wajib diisi.',

            'research_plan_keyword_id.required' =>
                'Keyword penelitian wajib dipilih.',

            'research_plan_keyword_id.exists' =>
                'Keyword penelitian tidak ditemukan.',

            'publish_year.max' =>
                'Tahun publikasi tidak boleh melebihi tahun sekarang.',
        ];
    }
}