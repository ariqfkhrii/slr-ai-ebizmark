<?php

namespace Tests\Feature;

use App\Models\ResearchPlan;
use App\Models\User;
use App\Services\OtherSourceIngestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OtherSourceControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->create([
            'email_verified_at' => now(),
        ]));
    }

    private function createResearchPlan(): ResearchPlan
    {
        return ResearchPlan::factory()->create();
    }

    private function createKeywordId(string $keyword = 'machine learning'): int
    {
        return DB::table('keywords')->insertGetId([
            'keyword' => $keyword,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function attachKeywordToResearchPlan(ResearchPlan $researchPlan, int $keywordId): void
    {
        \App\Models\ResearchPlanKeyword::create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id' => $keywordId,
        ]);
    }

    private function validPayload(int $keywordId, array $overrides = []): array
    {
        return array_merge([
            'pdf' => UploadedFile::fake()->create('paper.pdf', 100, 'application/pdf'),
            'research_plan_keyword_id' => $keywordId,
            'title' => 'A Study on Software Engineering Practices',
            'doi' => '10.1000/example.doi',
            'authors' => 'Doe J, Smith A',
            'tier' => 'q1',
            'article_keyword' => 'software engineering',
            'abstract' => 'This paper discusses software engineering practices.',
            'citation_count' => 12,
            'publish_year' => 2022,
        ], $overrides);
    }

    private function postOtherSource(string $uri, array $data)
    {
        return $this->post($uri, $data, ['Accept' => 'application/json']);
    }

    // index

    public function test_it_renders_the_upload_other_source_page_with_research_plan_id(): void
    {
        $researchPlan = $this->createResearchPlan();

        $response = $this->get(route('other-source.index', $researchPlan));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('upload-other-source/page')
            ->where('researchPlanId', $researchPlan->research_plan_id)
        );
    }

    public function test_it_returns_not_found_when_research_plan_does_not_exist_for_index(): void
    {
        $response = $this->get(route('other-source.index', ['researchPlan' => 999999]));

        $response->assertStatus(404);
    }

    public function test_it_requires_authentication_to_access_index(): void
    {
        Auth::logout();

        $researchPlan = $this->createResearchPlan();

        $response = $this->get(route('other-source.index', $researchPlan));

        $response->assertStatus(302);
    }

    // store

    public function test_it_stores_other_source_successfully(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $this->mock(OtherSourceIngestService::class, function ($mock) {
            $mock->shouldReceive('store')
                ->once()
                ->andReturn([
                    'success' => true,
                    'message' => 'Other source uploaded successfully.',
                    'data' => [
                        'raw_article_id' => 1,
                        'filtered_article_id' => 1,
                    ],
                ]);
        });

        $response = $this->postOtherSource(
            route('other-source.store', $researchPlan),
            $this->validPayload($keywordId)
        );

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Other source uploaded successfully.',
            ]);
    }

    public function test_it_returns_not_found_when_research_plan_does_not_exist_for_store(): void
    {
        $keywordId = $this->createKeywordId();

        $response = $this->postOtherSource(
            route('other-source.store', ['researchPlan' => 999999]),
            $this->validPayload($keywordId)
        );

        $response->assertStatus(404);
    }

    public function test_it_returns_validation_error_when_pdf_is_missing(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId);
        unset($payload['pdf']);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_it_returns_validation_error_when_pdf_is_not_a_pdf_file(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId, [
            'pdf' => UploadedFile::fake()->create('paper.txt', 100, 'text/plain'),
        ]);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_it_returns_validation_error_when_pdf_exceeds_maximum_size(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId, [
            'pdf' => UploadedFile::fake()->create('paper.pdf', 51201, 'application/pdf'),
        ]);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_it_returns_validation_error_when_title_is_missing(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId);
        unset($payload['title']);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_it_returns_validation_error_when_research_plan_keyword_id_is_missing(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId);
        unset($payload['research_plan_keyword_id']);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['research_plan_keyword_id']);
    }

    public function test_it_returns_validation_error_when_research_plan_keyword_id_does_not_exist(): void
    {
        $researchPlan = $this->createResearchPlan();

        $payload = $this->validPayload(999999);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['research_plan_keyword_id']);
    }

    public function test_it_returns_validation_error_when_tier_is_invalid(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId, ['tier' => 'q9']);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tier']);
    }

    public function test_it_returns_validation_error_when_publish_year_exceeds_current_year(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId, [
            'publish_year' => (int) date('Y') + 1,
        ]);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['publish_year']);
    }

    public function test_it_returns_validation_error_when_publish_year_is_not_four_digits(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId, ['publish_year' => 202]);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['publish_year']);
    }

    public function test_it_returns_validation_error_when_citation_count_is_negative(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $payload = $this->validPayload($keywordId, ['citation_count' => -5]);

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['citation_count']);
    }

    public function test_it_stores_successfully_with_optional_fields_omitted(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $this->mock(OtherSourceIngestService::class, function ($mock) {
            $mock->shouldReceive('store')
                ->once()
                ->andReturn([
                    'success' => true,
                    'message' => 'Other source uploaded successfully.',
                    'data' => [
                        'raw_article_id' => 2,
                        'filtered_article_id' => 2,
                    ],
                ]);
        });

        $payload = [
            'pdf' => UploadedFile::fake()->create('paper.pdf', 100, 'application/pdf'),
            'research_plan_keyword_id' => $keywordId,
            'title' => 'A Minimal Payload Study',
        ];

        $response = $this->postOtherSource(route('other-source.store', $researchPlan), $payload);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_it_propagates_exception_when_service_throws(): void
    {
        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $this->mock(OtherSourceIngestService::class, function ($mock) {
            $mock->shouldReceive('store')
                ->once()
                ->andThrow(new \RuntimeException('Embedding generation failed.'));
        });

        $response = $this->postOtherSource(
            route('other-source.store', $researchPlan),
            $this->validPayload($keywordId)
        );

        $response->assertStatus(500);
    }

    public function test_it_requires_authentication_to_access_store(): void
    {
        Auth::logout();

        $researchPlan = $this->createResearchPlan();
        $keywordId = $this->createKeywordId();

        $response = $this->postOtherSource(
            route('other-source.store', $researchPlan),
            $this->validPayload($keywordId)
        );

        $response->assertStatus(401);
    }

    // keywords

    public function test_it_returns_keywords_for_a_research_plan(): void
    {
        $researchPlan = $this->createResearchPlan();
        $firstKeywordId = $this->createKeywordId('artificial intelligence');
        $secondKeywordId = $this->createKeywordId('cloud computing');

        $this->attachKeywordToResearchPlan($researchPlan, $firstKeywordId);
        $this->attachKeywordToResearchPlan($researchPlan, $secondKeywordId);

        $response = $this->getJson(route('other-source.keywords', $researchPlan));

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $firstKeywordId, 'keyword' => 'artificial intelligence'])
            ->assertJsonFragment(['id' => $secondKeywordId, 'keyword' => 'cloud computing']);
    }

    public function test_it_only_returns_keywords_belonging_to_the_given_research_plan(): void
    {
        $researchPlanA = $this->createResearchPlan();
        $researchPlanB = $this->createResearchPlan();

        $keywordForA = $this->createKeywordId('quantum computing');
        $keywordForB = $this->createKeywordId('bioinformatics');

        $this->attachKeywordToResearchPlan($researchPlanA, $keywordForA);
        $this->attachKeywordToResearchPlan($researchPlanB, $keywordForB);

        $response = $this->getJson(route('other-source.keywords', $researchPlanA));

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $keywordForA, 'keyword' => 'quantum computing'])
            ->assertJsonMissing(['id' => $keywordForB]);
    }

    public function test_it_returns_empty_array_when_research_plan_has_no_keywords(): void
    {
        $researchPlan = $this->createResearchPlan();

        $response = $this->getJson(route('other-source.keywords', $researchPlan));

        $response->assertStatus(200)
            ->assertExactJson([]);
    }

    public function test_it_returns_not_found_when_research_plan_does_not_exist_for_keywords(): void
    {
        $response = $this->getJson(route('other-source.keywords', ['researchPlan' => 999999]));

        $response->assertStatus(404);
    }

    public function test_it_requires_authentication_to_access_keywords(): void
    {
        Auth::logout();

        $researchPlan = $this->createResearchPlan();

        $response = $this->getJson(route('other-source.keywords', $researchPlan));

        $response->assertStatus(401);
    }
}