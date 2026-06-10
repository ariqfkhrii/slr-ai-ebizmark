<?php

namespace Tests\Feature;

use App\Models\Extraction;
use App\Models\FilteredArticle;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AiExtractionRunTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_it_saves_ai_extraction_results(): void
    {
        config(['services.gemini.api_key' => 'test-key']);
        Storage::fake('public');

        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $raw = RawArticle::query()->create([
            'doi' => '10.1234/test.2',
            'title' => 'Extraction Article',
            'abstract' => 'Metadata abstract.',
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
            'pdf_path' => 'pdfs/missing.pdf',
        ]);

        $aiPayload = [
            'abstract' => 'AI abstract',
            'introduction' => 'AI introduction',
            'result' => 'AI result',
            'conclusion' => 'AI conclusion',
            'recommendation' => 'AI recommendation',
            'novelty_gap' => 'AI novelty gap',
            'limitation' => 'AI limitation',
            'future_research' => 'AI future research',
            'confidence_score' => 0.91,
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
            ->post('/ai-extraction/run', [
                'research_plan_id' => $plan->research_plan_id,
            ])
            ->assertOk()
            ->assertJsonFragment(['processed' => 1]);

        $review = Review::query()
            ->where('article_id', $filtered->filtered_article_id)
            ->first();

        $this->assertNotNull($review);

        $extraction = Extraction::query()
            ->where('review_id', $review->review_id)
            ->first();

        $this->assertNotNull($extraction);
        $this->assertSame('AI abstract', $extraction->abstract);
        $this->assertSame('AI introduction', $extraction->introduction);
        $this->assertSame('AI result', $extraction->result);
        $this->assertSame('AI conclusion', $extraction->conclusion);
        $this->assertSame('AI recommendation', $extraction->recommendation);
        $this->assertSame('AI novelty gap', $extraction->novelty_gap);
        $this->assertSame('AI limitation', $extraction->limitation);
        $this->assertSame('AI future research', $extraction->future_research);
        $this->assertSame('ai', $extraction->input_method);
        $this->assertSame('pending', $extraction->validation_status);
        $this->assertSame('0.91', (string) $extraction->confidence_score);
    }
}
