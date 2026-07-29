<?php

namespace Tests\Feature\Integration;

use App\Services\PubMedApiService;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('external-api')]
class PubMedApiIntegrationTest extends TestCase
{
    protected PubMedApiService $pubmedApi;

    protected function setUp(): void
    {
        parent::setUp();

        if (empty(config('services.pubmed.base_url'))) {
            $this->markTestSkipped('PUBMED_BASE_URL belum dikonfigurasi, skip integration test.');
        }

        $this->pubmedApi = app(PubMedApiService::class);
    }

    public function test_it_can_fetch_total_count_from_real_pubmed_api()
    {
        $total = $this->pubmedApi->getTotalCount('cancer', 2022, 2023);

        $this->assertIsInt($total);
        $this->assertGreaterThan(0, $total);
    }

    public function test_it_can_fetch_preview_ids_and_total_from_real_pubmed_api()
    {
        $result = $this->pubmedApi->searchIdsPreviewWithTotal('diabetes', 2022, 2023, 5);

        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('ids', $result);
        $this->assertIsInt($result['total']);
        $this->assertGreaterThan(0, $result['total']);
        $this->assertNotEmpty($result['ids']);
        $this->assertLessThanOrEqual(5, count($result['ids']));
    }

    public function test_it_can_fetch_article_details_in_xml_from_real_pubmed_api()
    {
        $preview = $this->pubmedApi->searchIdsPreviewWithTotal('diabetes', 2022, 2023, 3);
        $this->assertNotEmpty($preview['ids']);

        $xml = $this->pubmedApi->fetchDetails($preview['ids']);

        $this->assertNotEmpty($xml);
        $this->assertStringContainsString('<PubmedArticle', $xml);

        $parsed = simplexml_load_string($xml);
        $this->assertNotFalse($parsed);
    }

    public function test_it_can_fetch_citation_links_from_real_pubmed_api()
    {
        $preview = $this->pubmedApi->searchIdsPreviewWithTotal('diabetes', 2022, 2023, 3);
        $this->assertNotEmpty($preview['ids']);

        $xml = $this->pubmedApi->fetchCitations($preview['ids']);

        // elink kadang balikin LinkSet kosong kalau artikel belum pernah disitir,
        // jadi cukup pastikan responnya XML valid, bukan mesti ada isi Link-nya.
        $this->assertNotEmpty($xml);
        $parsed = simplexml_load_string($xml);
        $this->assertNotFalse($parsed);
    }

    public function test_it_can_search_ids_with_pagination_from_real_pubmed_api()
    {
        $query = $this->pubmedApi->buildPubMedQuery('covid vaccine') . ' AND 2022:2023[dp]';

        $ids = $this->pubmedApi->searchIds($query, 0, 5);

        $this->assertIsArray($ids);
        $this->assertNotEmpty($ids);
        $this->assertLessThanOrEqual(5, count($ids));
    }

    public function test_it_can_fetch_summaries_from_real_pubmed_api()
    {
        $ids = $this->pubmedApi->searchIds('covid[ti] AND 2022:2023[dp]', 0, 3);
        $this->assertNotEmpty($ids);

        $summaries = $this->pubmedApi->fetchSummaries($ids);

        $this->assertIsArray($summaries);
        $this->assertNotEmpty($summaries);
    }

    public function test_it_returns_empty_ids_for_a_nonsense_keyword_without_crashing()
    {
        $result = $this->pubmedApi->searchIdsPreviewWithTotal('zzqxqzqqxxnonsensekeyword12345', 2023, 2023, 5);

        $this->assertSame(0, $result['total']);
        $this->assertEmpty($result['ids']);
    }
}