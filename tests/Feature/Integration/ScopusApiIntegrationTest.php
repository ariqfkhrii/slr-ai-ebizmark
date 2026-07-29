<?php

namespace Tests\Feature\Integration;

use App\Services\ScopusApiService;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('external-api')]
class ScopusApiIntegrationTest extends TestCase
{
    protected ScopusApiService $scopusApi;

    protected function setUp(): void
    {
        parent::setUp();

        if (empty(config('services.scopus.key'))) {
            $this->markTestSkipped('SCOPUS_API_KEY belum diset di environment, skip integration test.');
        }

        $this->scopusApi = app(ScopusApiService::class);
    }

    public function test_it_can_fetch_total_count_from_real_scopus_api()
    {
        $total = $this->scopusApi->getTotalCount('machine learning', 2020, 2023);

        $this->assertIsInt($total);
        $this->assertGreaterThan(0, $total);
    }

    public function test_it_can_fetch_preview_with_total_and_entries_from_real_scopus_api()
    {
        $result = $this->scopusApi->searchPreviewWithTotal('artificial intelligence', 2022, 2023, 5);

        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('entries', $result);
        $this->assertIsInt($result['total']);
        $this->assertGreaterThan(0, $result['total']);
        $this->assertNotEmpty($result['entries']);

        $firstEntry = $result['entries'][0];
        $this->assertArrayHasKey('dc:title', $firstEntry);
    }

    public function test_it_can_paginate_search_results_from_real_scopus_api()
    {
        $query = $this->scopusApi->buildScopusQuery('deep learning')
            . ' AND PUBYEAR > 2021 AND PUBYEAR < 2024';

        $entries = $this->scopusApi->search($query, 5, 0);

        $this->assertIsArray($entries);
        $this->assertNotEmpty($entries);
        $this->assertLessThanOrEqual(5, count($entries));
    }

    public function test_it_returns_zero_total_for_a_nonsense_keyword_without_crashing()
    {
        // Keyword absurd, harusnya tetap dapat response valid dari API dengan total 0,
        // bukan exception (memastikan handleApiResponseErrors gak salah kaprah nganggep ini error)
        $total = $this->scopusApi->getTotalCount('zzqxqzqqxxnonsensekeyword12345', 2023, 2023);

        $this->assertIsInt($total);
        $this->assertSame(0, $total);
    }

    public function test_it_throws_auth_error_when_api_key_is_invalid()
    {
        config(['services.scopus.key' => 'invalid-api-key-untuk-testing']);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('AUTH_ERROR');

        $this->scopusApi->getTotalCount('test', 2023, 2023);
    }
}
