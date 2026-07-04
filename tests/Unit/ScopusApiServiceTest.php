<?php

namespace Tests\Unit;

use App\Services\ScopusApiService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ScopusApiServiceTest extends TestCase
{
    protected ScopusApiService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->service = new ScopusApiService();

        RateLimiter::clear('scopus_api_limiter');
    }

    public function test_it_returns_results_on_successful_api_call()
    {
        Http::fake([
            config('services.scopus.base_url') . '*' => Http::response([
                'search-results' => [
                    'opensearch:totalResults' => '150',
                    'entry' => [
                        ['dc:title' => 'Artikel Scopus 1'],
                        ['dc:title' => 'Artikel Scopus 2'],
                    ]
                ]
            ], 200)
        ]);

        $result = $this->service->searchPreviewWithTotal('machine learning', 2020, 2024);

        $this->assertEquals(150, $result['total']);
        $this->assertIsArray($result['entries']);
        $this->assertCount(2, $result['entries']);
        $this->assertEquals('Artikel Scopus 1', $result['entries'][0]['dc:title']);
    }

    public function test_it_returns_total_count_on_successful_count_call()
    {
        Http::fake([
            config('services.scopus.base_url') . '*' => Http::response([
                'search-results' => [
                    'opensearch:totalResults' => '321',
                ],
            ], 200),
        ]);

        $result = $this->service->getTotalCount('machine learning', 2020, 2024);

        $this->assertSame(321, $result);
    }

    public function test_it_returns_entries_on_successful_search_call()
    {
        Http::fake([
            config('services.scopus.base_url') . '*' => Http::response([
                'search-results' => [
                    'entry' => [
                        ['dc:title' => 'Artikel Scopus 1'],
                        ['dc:title' => 'Artikel Scopus 2'],
                    ],
                ],
            ], 200),
        ]);

        $result = $this->service->search('TITLE-ABS-KEY("machine learning")', 25, 0);

        $this->assertCount(2, $result);
        $this->assertSame('Artikel Scopus 1', $result[0]['dc:title']);
    }

    public function test_it_throws_exception_on_api_rate_limit()
    {
        Http::fake([
            config('services.scopus.base_url') . '*' => Http::response('Quota Exceeded', 429)
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('API_RATE_LIMIT');

        $this->service->searchPreviewWithTotal('machine learning', 2020, 2024);
    }

    public function test_it_returns_empty_and_logs_warning_on_api_failure()
    {
        Http::fake([
            config('services.scopus.base_url') . '*' => Http::response('Internal Server Error', 500)
        ]);

        Log::shouldReceive('warning')
            ->once()
            ->with('Scopus Search Preview API Failed: Internal Server Error');

        $result = $this->service->searchPreviewWithTotal('machine learning', 2020, 2024);

        $this->assertEquals(0, $result['total']);
        $this->assertEmpty($result['entries']);
    }

    public function test_it_returns_zero_and_logs_error_on_count_failure()
    {
        Http::fake([
            config('services.scopus.base_url') . '*' => Http::response('Internal Server Error', 500),
        ]);

        Log::shouldReceive('error')
            ->once()
            ->with('Scopus Count API Failed: Internal Server Error');

        $result = $this->service->getTotalCount('machine learning', 2020, 2024);

        $this->assertSame(0, $result);
    }

    public function test_it_returns_empty_array_and_logs_warning_on_search_failure()
    {
        Http::fake([
            config('services.scopus.base_url') . '*' => Http::response('Internal Server Error', 500),
        ]);

        Log::shouldReceive('warning')
            ->once()
            ->with('Scopus Search API Failed: Internal Server Error', [
                'status' => 500,
            ]);

        $result = $this->service->search('TITLE-ABS-KEY("machine learning")', 25, 0);

        $this->assertSame([], $result);
    }
}