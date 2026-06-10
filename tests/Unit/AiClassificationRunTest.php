<?php

namespace Tests\Feature;

use App\Models\ArticleClassification;
use App\Models\ClassificationSetup;
use App\Models\FilteredArticle;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiClassificationRunTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_it_saves_ai_classification_results_by_category(): void
    {
        config(['services.gemini.api_key' => 'test-key']);

        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $raw = RawArticle::query()->create([
            'doi' => '10.1234/test.1',
            'title' => 'Test Article',
            'abstract' => 'Sample abstract.',
            'authors' => 'Doe et al.',
            'publish_year' => 2024,
        ]);

        $filtered = FilteredArticle::query()->create([
            'raw_article_id' => $raw->id,
            'research_plan_id' => $plan->research_plan_id,
            'article_status' => 'included',
            'retrieved' => true,
            'included' => true,
            'ai_usage_status' => 'not_used',
        ]);

        ClassificationSetup::query()->create([
            'research_plan_id' => $plan->research_plan_id,
            'category_1' => 'Research Topic',
            'category_2' => 'Data Source',
        ]);

        $aiPayload = [
            'research_method' => 'Survey',
            'grand_theory' => 'Technology Acceptance Model',
            'categories' => [
                '1' => 'AI Adoption',
                '2' => 'Survey Dataset',
            ],
        ];

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($aiPayload)],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $this->actingAs($user)
            ->post('/ai-classification/run', [
                'research_plan_id' => $plan->research_plan_id,
            ])
            ->assertOk()
            ->assertJsonFragment(['processed' => 1]);

        $review = Review::query()
            ->where('article_id', $filtered->filtered_article_id)
            ->first();

        $this->assertNotNull($review);

        $classification = ArticleClassification::query()
            ->where('review_id', $review->review_id)
            ->first();

        $this->assertNotNull($classification);
        $this->assertSame('Survey', $classification->research_method);
        $this->assertSame('AI Adoption', $classification->category_1);
        $this->assertSame('Survey Dataset', $classification->category_2);
        $this->assertSame('Technology Acceptance Model', $classification->grand_theory);
    }
}