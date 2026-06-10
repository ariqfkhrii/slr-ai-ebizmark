<?php

namespace Database\Seeders;

use App\Models\Keyword;
use Illuminate\Database\Seeder;

class KeywordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $keywords = [
            'machine learning',
            'covid-19',
            'system architecture design',
            'federated learning',
            'system architecture design software',
            'stunting prediction',
        ];

        foreach ($keywords as $keyword) {
            Keyword::create([
                'keyword' => $keyword,
            ]);
        }
    }
}
