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
    /**
     * Seed a minimal PRISMA demo dataset.
     */
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
            ]
        );

        $researchPlan = ResearchPlan::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'title' => 'PRISMA Demo',
            ],
            [
                'scopus_quantity' => 2,
                'pubmed_quantity' => 0,
                'extraction_count' => 2,
            ]
        );

        $countryOne = Country::query()->firstOrCreate([
            'name' => 'United States',
        ]);

        $countryTwo = Country::query()->firstOrCreate([
            'name' => 'Indonesia',
        ]);

        $firstRawArticle = RawArticle::query()->updateOrCreate(
            ['doi' => '10.1016/j.appet.2022.106350'],
            [
                'title' => 'Sample literature review article for DOI 10.1016/j.appet.2022.106350',
                'authors' => 'Doe, Jane; Smith, John',
                'issn_print' => '0195-6663',
                'issn_e' => '0195-6663',
                'publish_year' => 2022,
                'tier' => 'Q1',
                'citation_count' => 12,
                'source_db' => 'scopus',
            ]
        );
        $firstRawArticle->forceFill([
            'abstract' => 'Demo abstract for the PRISMA retrieval example.',
        ])->save();
        $firstRawArticle->countries()->syncWithoutDetaching([$countryOne->getKey()]);

        $secondRawArticle = RawArticle::query()->updateOrCreate(
            ['doi' => '10.1080/23750472.2022.2089204'],
            [
                'title' => 'Sample retrieval article for DOI 10.1080/23750472.2022.2089204',
                'authors' => 'Doe, Alex; Tan, Siti',
                'issn_print' => '2375-0472',
                'issn_e' => '2375-0472',
                'publish_year' => 2022,
                'tier' => 'Q2',
                'citation_count' => 7,
                'source_db' => 'scopus',
            ]
        );
        $secondRawArticle->forceFill([
            'abstract' => 'Second demo abstract for matching DOI text from PDF.',
        ])->save();
        $secondRawArticle->countries()->syncWithoutDetaching([$countryTwo->getKey()]);

        FilteredArticle::query()->updateOrCreate(
            [
                'raw_article_id' => $firstRawArticle->getKey(),
                'research_plan_id' => $researchPlan->research_plan_id,
            ],
            [
                'novelty_status' => true,
                'article_status' => 'included',
                'included' => true,
                'retrieved' => true,
                'ai_usage_status' => false,
                'pdf_path' => 'demo/prisma/10.1016-j.appet.2022.106350.pdf',
            ]
        );

        FilteredArticle::query()->updateOrCreate(
            [
                'raw_article_id' => $secondRawArticle->getKey(),
                'research_plan_id' => $researchPlan->research_plan_id,
            ],
            [
                'novelty_status' => false,
                'article_status' => 'screening',
                'included' => false,
                'retrieved' => false,
                'ai_usage_status' => false,
                'pdf_path' => 'demo/prisma/10.1080-23750472.2022.2089204.pdf',
            ]
        );
    }
}
