<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\FilteredArticle;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class PrismaDemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        $countryOne = Country::firstOrCreate(['name' => 'United States']);
        $countryTwo = Country::firstOrCreate(['name' => 'Indonesia']);

        // 🔥 FIX UTAMA (PASTI AMAN, GAK NULL)
        $researchPlan = ResearchPlan::first();

        if (!$researchPlan) {
            throw new \Exception('ResearchPlan kosong. Jalankan ResearchPlanSeeder dulu.');
        }

        $firstRawArticle = RawArticle::query()->updateOrCreate(
            ['doi' => '10.1016/j.appet.2022.106350'],
            [
                'title' => 'Sample literature review article for DOI 10.1016/j.appet.2022.106350',
                'source_db' => 'scopus',
                'authors' => 'Doe, Jane; Smith, John',
                'keyword' => 'AI, healthcare',
                'abstract' => 'Demo abstract for PRISMA retrieval example.',
                'issn_print' => '0195-6663',
                'issn_e' => '0195-6663',
                'publish_year' => 2022,
                'tier' => 'Q1',
                'citation_count' => 12,
            ]
        );

        $firstRawArticle->countries()->syncWithoutDetaching([$countryOne->id]);

        $secondRawArticle = RawArticle::query()->updateOrCreate(
            ['doi' => '10.1080/23750472.2022.2089204'],
            [
                'title' => 'Sample retrieval article for DOI 10.1080/23750472.2022.2089204',
                'source_db' => 'pubmed',
                'authors' => 'Doe, Alex; Tan, Siti',
                'keyword' => 'ML, disease prediction',
                'abstract' => 'Second demo abstract for PRISMA flow.',
                'issn_print' => '2375-0472',
                'issn_e' => '2375-0472',
                'publish_year' => 2022,
                'tier' => 'Q2',
                'citation_count' => 7,
            ]
        );

        $secondRawArticle->countries()->syncWithoutDetaching([$countryTwo->id]);

        // 🔥 FIX UTAMA: PAKAI getKey() (ANTI NULL / ANTI PK ISSUE)
        FilteredArticle::query()->updateOrCreate(
            [
                'raw_article_id' => $firstRawArticle->id,
                'research_plan_id' => $researchPlan->getKey(),
            ],
            [
                'novelty_status' => true,
                'article_status' => 'included',
                'included' => true,
                'retrieved' => true,
                'ai_usage_status' => false,
                'pdf_path' => 'demo/prisma/first.pdf',
            ]
        );

        FilteredArticle::query()->updateOrCreate(
            [
                'raw_article_id' => $secondRawArticle->id,
                'research_plan_id' => $researchPlan->getKey(),
            ],
            [
                'novelty_status' => false,
                'article_status' => 'screening',
                'included' => false,
                'retrieved' => false,
                'ai_usage_status' => false,
                'pdf_path' => 'demo/prisma/second.pdf',
            ]
        );
    }
}