<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdatePurificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'article_ids' => ['required', 'array', 'min:1'],
            'article_ids.*' => ['integer', 'exists:filtered_articles,id'],
            'included' => ['required', 'boolean'],
        ];
    }
}