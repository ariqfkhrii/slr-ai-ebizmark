<?php

namespace App\Http\Requests;

use App\Enums\SourceDatabase;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreResearchPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'source_database' => ['required', new Enum(SourceDatabase::class)],
        ];
    }

    // Tambahkan method ini di bawah method rules()
    public function messages(): array
    {
        return [
            'title.required' => 'Judul rencana riset wajib diisi.',
            'title.max'      => 'Judul rencana riset tidak boleh lebih dari 255 karakter, silakan dipersingkat!',
            'title.string'   => 'Judul harus berupa teks.',
            'source_database.required' => 'Sumber database wajib diisi.',
            'source_database.enum' => 'Sumber database harus salah satu dari: Scopus atau PubMed.',
        ];
    }
}
