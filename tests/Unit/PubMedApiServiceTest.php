<?php

namespace Tests\Unit;

use App\Services\PubMedApiService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class PubMedApiServiceTest extends TestCase
{
    protected PubMedApiService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->service = new PubMedApiService();
        
        RateLimiter::clear('pubmed_api_limiter');
    }

    public function test_search_ids_preview_with_total_success()
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => [
                    'count' => 85,
                    'idlist' => ['12345', '67890']
                ]
            ], 200)
        ]);

        $result = $this->service->searchIdsPreviewWithTotal('federated learning', 2020, 2024);

        $this->assertEquals(85, $result['total']);
        $this->assertIsArray($result['ids']);
        $this->assertCount(2, $result['ids']);
        $this->assertEquals('12345', $result['ids'][0]);
    }

    public function test_search_ids_preview_with_total_failure()
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response('Server Error', 500)
        ]);

        Log::shouldReceive('warning')->once();

        $result = $this->service->searchIdsPreviewWithTotal('federated learning', 2020, 2024);

        $this->assertEquals(0, $result['total']);
        $this->assertEmpty($result['ids']);
    }

    public function test_fetch_details_returns_empty_when_ids_empty()
    {
        $result = $this->service->fetchDetails([]);
        
        $this->assertEquals('', $result);
    }

    public function test_fetch_details_success()
    {
        Http::fake([
            '*efetch.fcgi*' => Http::response('<PubmedArticleSet></PubmedArticleSet>', 200)
        ]);

        $result = $this->service->fetchDetails(['12345', '67890']);

        $this->assertStringContainsString('<PubmedArticleSet', $result);
    }

    public function test_fetch_details_failure()
    {
        Http::fake([
            '*efetch.fcgi*' => Http::response('Server Error', 500)
        ]);

        Log::shouldReceive('warning')->once();

        $result = $this->service->fetchDetails(['12345', '67890']);

        $this->assertEquals('', $result);
    }

    public function test_fetch_citations_returns_empty_when_ids_empty()
    {
        $result = $this->service->fetchCitations([]);
        
        $this->assertEquals('', $result);
    }

    public function test_fetch_citations_success()
    {
        Http::fake([
            '*elink.fcgi*' => Http::response('<LinkSet></LinkSet>', 200)
        ]);

        $result = $this->service->fetchCitations(['12345', '67890']);

        $this->assertStringContainsString('<LinkSet', $result);
    }

    public function test_fetch_citations_failure()
    {
        Http::fake([
            '*elink.fcgi*' => Http::response('Server Error', 500)
        ]);

        Log::shouldReceive('warning')->once();

        $result = $this->service->fetchCitations(['12345', '67890']);

        $this->assertEquals('', $result);
    }
}
