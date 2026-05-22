<?php

namespace Database\Seeders;

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

        $firstRawArticle = RawArticle::query()->updateOrCreate(
            ['doi' => '10.1016/j.appet.2022.106350'],
            [
                'title' => 'Sample literature review article for DOI 10.1016/j.appet.2022.106350',
                'issn' => '0195-6663',
                'abstract' => 'Demo abstract for the PRISMA retrieval example.',
                'publish_year' => 2022,
                'country_id' => 1,
                'tier' => 'Q1',
                'citation_count' => 12,
            ]
        );

        $secondRawArticle = RawArticle::query()->updateOrCreate(
            ['doi' => '10.1080/23750472.2022.2089204'],
            [
                'title' => 'Sample retrieval article for DOI 10.1080/23750472.2022.2089204',
                'issn' => '2375-0472',
                'abstract' => 'Second demo abstract for matching DOI text from PDF.',
                'publish_year' => 2022,
                'country_id' => 2,
                'tier' => 'Q2',
                'citation_count' => 7,
            ]
        );

        FilteredArticle::query()->updateOrCreate(
            [
                'raw_article_id' => $firstRawArticle->article_id,
                'research_plan_id' => $researchPlan->research_plan_id,
            ],
            [
                'novelty_status' => 'novelty',
                'article_status' => 'included',
                'included' => true,
                'retrieved' => 'Retrieved',
                'ai_usage_status' => 'not_used',
            ]
        );

        FilteredArticle::query()->updateOrCreate(
            [
                'raw_article_id' => $secondRawArticle->article_id,
                'research_plan_id' => $researchPlan->research_plan_id,
            ],
            [
                'novelty_status' => 'not_novelty',
                'article_status' => 'screening',
                'included' => false,
                'retrieved' => 'Not Retrieved',
                'ai_usage_status' => 'not_used',
            ]
        );
    }
}
