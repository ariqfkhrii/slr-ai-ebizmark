<?php

namespace Tests\Unit;

use App\Models\Keyword;
use App\Models\ResearchPlan;
use App\Models\User;
use App\Services\MetadataSearchServices;
use App\Services\PubMedApiService;
use App\Services\ScopusApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Tests\TestCase;

class MetadataSearchServicesTest extends TestCase
{
    use RefreshDatabase;

    protected $scopusApiMock;
    protected $pubmedApiMock;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->scopusApiMock = Mockery::mock(ScopusApiService::class);
        $this->pubmedApiMock = Mockery::mock(PubMedApiService::class);

        $this->service = new MetadataSearchServices($this->scopusApiMock, $this->pubmedApiMock);

        Cache::shouldReceive('remember')
            ->andReturnUsing(function ($key, $ttl, $callback) {
                return $callback();
            });
    }

    public function test_it_returns_recommended_true_when_total_count_is_between_100_and_5000()
    {
        $user = User::factory()->create();

        $keyword = Keyword::create(['keyword' => 'machine learning']);
        $plan = ResearchPlan::create([
            'title' => 'Test Plan',
            'source_database' => 'scopus',
            'user_id' => $user->id
        ]);

        $validatedData = [
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2024,
        ];

        $this->scopusApiMock->shouldReceive('searchPreviewWithTotal')
            ->once()
            ->with('machine learning', 2020, 2024, 25)
            ->andReturn([
                'total' => 500,
                'entries' => []
            ]);

        $result = $this->service->getPreviewResults($plan->research_plan_id, $validatedData);

        $this->assertEquals(500, $result['total_count']);
        $this->assertTrue($result['is_recommended']);
        $this->assertEquals('scopus', $result['source']);
    }

    public function test_it_returns_recommended_false_when_total_count_is_less_than_100()
    {
        $user = User::factory()->create();

        $keyword = Keyword::create(['keyword' => 'stunting prediction']);
        $plan = ResearchPlan::create([
            'title' => 'Test Plan',
            'source_database' => 'pubmed',
            'user_id' => $user->id
        ]);

        $validatedData = [
            'keyword_id' => $keyword->id,
            'start_year' => 2021,
            'end_year'   => 2023,
        ];

        $this->pubmedApiMock->shouldReceive('searchIdsPreviewWithTotal')
            ->once()
            ->with('stunting prediction', 2021, 2023, 25)
            ->andReturn([
                'total' => 50,
                'ids' => []
            ]);

        $result = $this->service->getPreviewResults($plan->research_plan_id, $validatedData);

        $this->assertEquals(50, $result['total_count']);
        $this->assertFalse($result['is_recommended']);
    }

    public function test_it_returns_recommended_false_when_total_count_is_greater_than_5000()
    {
        $user = User::factory()->create();
        $keyword = Keyword::create(['keyword' => 'covid-19']);
        $plan = ResearchPlan::create([
            'title' => 'Test Plan',
            'source_database' => 'scopus',
            'user_id' => $user->id
        ]);

        $validatedData = [
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2024,
        ];

        $this->scopusApiMock->shouldReceive('searchPreviewWithTotal')
            ->once()
            ->andReturn([
                'total' => 6000,
                'entries' => []
            ]);

        $result = $this->service->getPreviewResults($plan->research_plan_id, $validatedData);

        $this->assertEquals(6000, $result['total_count']);
        $this->assertFalse($result['is_recommended']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
