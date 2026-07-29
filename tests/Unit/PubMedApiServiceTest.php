<?php

namespace Tests\Unit;

use App\Services\PubMedApiService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use ReflectionClass;
use Tests\TestCase;

class PubMedApiServiceTest extends TestCase
{
    protected PubMedApiService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new PubMedApiService();

        config([
            'services.pubmed.base_url' => 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
            'services.pubmed.key'      => 'dummy-api-key',
        ]);

        // Reset rate limiter counter tiap test biar ga saling ganggu
        RateLimiter::clear('pubmed_api_limiter');
    }

    /**
     * Helper untuk memanggil method protected/private via reflection.
     */
    protected function callProtected(object $object, string $method, array $args = [])
    {
        $ref = new ReflectionClass($object);
        $m = $ref->getMethod($method);
        $m->setAccessible(true);

        return $m->invokeArgs($object, $args);
    }

    // ==========================================================
    // buildEndpoint()
    // ==========================================================

    public function test_build_endpoint_replaces_esearch_suffix_with_target_endpoint(): void
    {
        config(['services.pubmed.base_url' => 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi']);

        $result = $this->callProtected($this->service, 'buildEndpoint', ['efetch.fcgi']);

        $this->assertSame('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi', $result);
    }

    public function test_build_endpoint_appends_endpoint_when_base_url_has_no_esearch_suffix(): void
    {
        config(['services.pubmed.base_url' => 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils']);

        $result = $this->callProtected($this->service, 'buildEndpoint', ['esummary.fcgi']);

        $this->assertSame('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', $result);
    }

    public function test_build_endpoint_trims_trailing_slash_on_base_url(): void
    {
        config(['services.pubmed.base_url' => 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/']);

        $result = $this->callProtected($this->service, 'buildEndpoint', ['elink.fcgi']);

        $this->assertSame('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi', $result);
    }

    // ==========================================================
    // enforceRateLimit()
    // ==========================================================

    public function test_enforce_rate_limit_registers_a_hit_when_under_the_limit(): void
    {
        config(['services.pubmed.key' => 'dummy-api-key']); // hasApiKey = true -> max 10

        $this->assertSame(0, RateLimiter::attempts('pubmed_api_limiter'));

        $this->callProtected($this->service, 'enforceRateLimit');

        $this->assertSame(1, RateLimiter::attempts('pubmed_api_limiter'));
    }

    public function test_enforce_rate_limit_uses_max_3_attempts_without_api_key(): void
    {
        config(['services.pubmed.key' => null]);

        // Isi limiter sampai pas di batas (3), lalu pastikan attempt ke-4 dianggap "tooManyAttempts"
        RateLimiter::hit('pubmed_api_limiter', 60);
        RateLimiter::hit('pubmed_api_limiter', 60);
        RateLimiter::hit('pubmed_api_limiter', 60);

        $this->assertTrue(RateLimiter::tooManyAttempts('pubmed_api_limiter', 3));
    }

    public function test_enforce_rate_limit_allows_up_to_10_attempts_with_api_key(): void
    {
        config(['services.pubmed.key' => 'dummy-api-key']);

        for ($i = 0; $i < 9; $i++) {
            RateLimiter::hit('pubmed_api_limiter', 60);
        }

        // Baru 9 attempt, limit 10 -> belum kena tooManyAttempts
        $this->assertFalse(RateLimiter::tooManyAttempts('pubmed_api_limiter', 10));

        $this->callProtected($this->service, 'enforceRateLimit');

        $this->assertSame(10, RateLimiter::attempts('pubmed_api_limiter'));
    }

    // ==========================================================
    // buildPubMedQuery()
    // ==========================================================

    public function test_build_query_single_word_is_wrapped_in_parentheses_without_ti_tag(): void
    {
        // Catatan: karena $isSingleWord = true, kondisi `!$isSingleWord` di source
        // membuat single word TIDAK masuk ke branch "[ti]" dan malah diproses
        // lewat branch pembangunan query dengan tanda kurung biasa.
        $result = $this->service->buildPubMedQuery('diabetes');

        $this->assertSame('(diabetes)', $result);
    }


    public function test_build_query_multi_word_without_separator_gets_quoted_and_ti_tag(): void
    {
        $result = $this->service->buildPubMedQuery('machine learning');

        $this->assertSame('"machine learning"[ti]', $result);
    }

    public function test_build_query_does_not_double_quote_already_quoted_phrase(): void
    {
        $result = $this->service->buildPubMedQuery('"machine learning"');

        $this->assertSame('"machine learning"[ti]', $result);
    }

    public function test_build_query_with_semicolon_separated_terms_joins_with_and(): void
    {
        $result = $this->service->buildPubMedQuery('diabetes; insulin resistance');

        $this->assertSame('(diabetes AND "insulin resistance")', $result);
    }

    public function test_build_query_with_exclamation_prefix_produces_not_clause(): void
    {
        $result = $this->service->buildPubMedQuery('diabetes; !type 1');

        $this->assertSame('(diabetes NOT "type 1")', $result);
    }

    public function test_build_query_trims_whitespace_before_processing(): void
    {
        $result = $this->service->buildPubMedQuery('   diabetes   ');

        $this->assertSame('(diabetes)', $result);
    }

    public function test_build_query_filters_out_empty_segments_between_semicolons(): void
    {
        $result = $this->service->buildPubMedQuery('diabetes;; insulin');

        $this->assertSame('(diabetes AND insulin)', $result);
    }

    // ==========================================================
    // searchIdsPreviewWithTotal()
    // ==========================================================

    public function test_search_ids_preview_with_total_returns_total_and_ids(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => [
                    'count'  => '150',
                    'idlist' => ['111', '222', '333'],
                ],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->service->searchIdsPreviewWithTotal('diabetes', 2018, 2023, 3);

        $this->assertSame(150, $result['total']);
        $this->assertSame(['111', '222', '333'], $result['ids']);
    }

    public function test_search_ids_preview_with_total_sends_expected_query_parameters(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => ['count' => '0', 'idlist' => []],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $this->service->searchIdsPreviewWithTotal('diabetes mellitus', 2018, 2023, 10);

        Http::assertSent(function (Request $request) {
            $data = $request->data();

            return str_contains($request->url(), 'esearch.fcgi')
                && $data['db'] === 'pubmed'
                && $data['retmode'] === 'json'
                && $data['retstart'] === 0
                && $data['retmax'] === 10
                && str_contains($data['term'], '"diabetes mellitus"[ti]')
                && str_contains($data['term'], '2018:2023[dp]')
                && str_contains($data['term'], 'medline"[sb]');
        });
    }

    public function test_search_ids_preview_with_total_defaults_to_25_when_count_not_provided(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => ['count' => '0', 'idlist' => []],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $this->service->searchIdsPreviewWithTotal('diabetes', 2018, 2023);

        Http::assertSent(fn (Request $request) => $request->data()['retmax'] === 25);
    }

    public function test_search_ids_preview_with_total_returns_zero_and_empty_array_when_fields_missing(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([], 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->service->searchIdsPreviewWithTotal('diabetes', 2018, 2023);

        $this->assertSame(0, $result['total']);
        $this->assertSame([], $result['ids']);
    }

    public function test_search_ids_preview_with_total_throws_on_http_error(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response('Bad Request', 400),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->service->searchIdsPreviewWithTotal('diabetes', 2018, 2023);
    }

    // ==========================================================
    // fetchDetails()
    // ==========================================================

    public function test_fetch_details_returns_empty_string_for_empty_ids(): void
    {
        Http::fake();

        $result = $this->service->fetchDetails([]);

        $this->assertSame('', $result);
        Http::assertNothingSent();
    }

    public function test_fetch_details_returns_raw_xml_body(): void
    {
        $xml = '<PubmedArticleSet><PubmedArticle/></PubmedArticleSet>';

        Http::fake([
            '*efetch.fcgi*' => Http::response($xml, 200, ['Content-Type' => 'application/xml']),
        ]);

        $result = $this->service->fetchDetails(['111', '222']);

        $this->assertSame($xml, $result);
    }

    public function test_fetch_details_sends_comma_separated_ids_as_form_post(): void
    {
        Http::fake([
            '*efetch.fcgi*' => Http::response('<xml/>', 200, ['Content-Type' => 'application/xml']),
        ]);

        $this->service->fetchDetails(['111', '222', '333']);

        Http::assertSent(function (Request $request) {
            return $request->method() === 'POST'
                && str_contains($request->url(), 'efetch.fcgi')
                && $request['db'] === 'pubmed'
                && $request['retmode'] === 'xml'
                && $request['id'] === '111,222,333';
        });
    }

    public function test_fetch_details_throws_on_xml_error_body(): void
    {
        Http::fake([
            '*efetch.fcgi*' => Http::response('<ERROR>invalid id</ERROR>', 200, ['Content-Type' => 'application/xml']),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->service->fetchDetails(['999']);
    }

    // ==========================================================
    // fetchCitations()
    // ==========================================================

    public function test_fetch_citations_returns_empty_string_for_empty_ids(): void
    {
        Http::fake();

        $result = $this->service->fetchCitations([]);

        $this->assertSame('', $result);
        Http::assertNothingSent();
    }

    public function test_fetch_citations_returns_raw_xml_body_and_sends_correct_params(): void
    {
        $xml = '<eLinkResult/>';

        Http::fake([
            '*elink.fcgi*' => Http::response($xml, 200, ['Content-Type' => 'application/xml']),
        ]);

        $result = $this->service->fetchCitations(['111', '222']);

        $this->assertSame($xml, $result);

        Http::assertSent(function (Request $request) {
            return $request->method() === 'POST'
                && $request['dbfrom'] === 'pubmed'
                && $request['linkname'] === 'pubmed_pubmed_citedin'
                && $request['retmode'] === 'xml'
                && $request['id'] === '111,222';
        });
    }

    // ==========================================================
    // getTotalCount()
    // ==========================================================

    public function test_get_total_count_returns_count_from_response(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => ['count' => '4321'],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->service->getTotalCount('cancer', 2020, 2024);

        $this->assertSame(4321, $result);
    }

    public function test_get_total_count_includes_year_filter_when_both_years_provided(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => ['count' => '10'],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $this->service->getTotalCount('cancer', 2020, 2024);

        Http::assertSent(fn (Request $request) => str_contains($request->data()['term'], '2020:2024[dp]'));
    }

    public function test_get_total_count_omits_year_filter_when_years_are_null(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => ['count' => '10'],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $this->service->getTotalCount('cancer', null, null);

        Http::assertSent(fn (Request $request) => !str_contains($request->data()['term'], '[dp]'));
    }

    public function test_get_total_count_returns_zero_when_count_key_missing(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([], 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->service->getTotalCount('cancer', 2020, 2024);

        $this->assertSame(0, $result);
    }

    public function test_get_total_count_throws_on_rate_limit_response(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response('Too Many Requests', 429),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('API_RATE_LIMIT');

        $this->service->getTotalCount('cancer', 2020, 2024);
    }

    // ==========================================================
    // searchIds()
    // ==========================================================

    public function test_search_ids_returns_id_list_with_pagination_params(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([
                'esearchresult' => ['idlist' => ['1', '2', '3']],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->service->searchIds('cancer[ti]', 20, 10);

        $this->assertSame(['1', '2', '3'], $result);

        Http::assertSent(function (Request $request) {
            $data = $request->data();

            return $data['term'] === 'cancer[ti]'
                && $data['retstart'] === 20
                && $data['retmax'] === 10;
        });
    }

    public function test_search_ids_returns_empty_array_when_idlist_missing(): void
    {
        Http::fake([
            '*esearch.fcgi*' => Http::response([], 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->service->searchIds('cancer[ti]', 0, 10);

        $this->assertSame([], $result);
    }

    // ==========================================================
    // fetchSummaries()
    // ==========================================================

    public function test_fetch_summaries_returns_empty_array_for_empty_ids(): void
    {
        Http::fake();

        $result = $this->service->fetchSummaries([]);

        $this->assertSame([], $result);
        Http::assertNothingSent();
    }

    public function test_fetch_summaries_returns_result_key_from_response(): void
    {
        Http::fake([
            '*esummary.fcgi*' => Http::response([
                'result' => [
                    'uids'  => ['111', '222'],
                    '111'   => ['title' => 'Article A'],
                    '222'   => ['title' => 'Article B'],
                ],
            ], 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->service->fetchSummaries(['111', '222']);

        $this->assertSame(['111', '222'], $result['uids']);
        $this->assertSame('Article A', $result['111']['title']);

        Http::assertSent(fn (Request $request) => $request['id'] === '111,222');
    }

    // ==========================================================
    // handleApiResponseErrors() - via reflection, tanpa perlu HTTP call sungguhan
    // ==========================================================

    protected function fakeResponse(int $status, string $body, array $headers = []): \Illuminate\Http\Client\Response
    {
        $factory = new \Illuminate\Http\Client\Factory();
        $factory->fake([
            '*' => Http::response($body, $status, $headers),
        ]);

        return $factory->get('https://example.com');
    }

    public function test_handle_api_response_errors_throws_bad_request_on_400(): void
    {
        $response = $this->fakeResponse(400, 'Bad Request');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_api_response_errors_throws_auth_error_on_401_and_403(): void
    {
        foreach ([401, 403] as $status) {
            try {
                $response = $this->fakeResponse($status, 'Unauthorized');
                $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
                $this->fail('Expected exception was not thrown for status ' . $status);
            } catch (\Exception $e) {
                $this->assertSame('AUTH_ERROR', $e->getMessage());
            }
        }
    }

    public function test_handle_api_response_errors_throws_rate_limit_on_429(): void
    {
        $response = $this->fakeResponse(429, 'Too Many Requests');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('API_RATE_LIMIT');

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_api_response_errors_throws_server_error_on_5xx(): void
    {
        foreach ([500, 502, 503, 504] as $status) {
            try {
                $response = $this->fakeResponse($status, 'Server Error');
                $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
                $this->fail('Expected exception was not thrown for status ' . $status);
            } catch (\Exception $e) {
                $this->assertSame('SERVER_ERROR', $e->getMessage());
            }
        }
    }

    public function test_handle_api_response_errors_throws_unknown_error_on_other_status(): void
    {
        $response = $this->fakeResponse(418, "I'm a teapot");

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('UNKNOWN_API_ERROR');

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_api_response_errors_throws_on_json_error_key(): void
    {
        $response = $this->fakeResponse(200, json_encode(['error' => 'invalid term']), ['Content-Type' => 'application/json']);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_api_response_errors_throws_on_esearchresult_errorlist(): void
    {
        $response = $this->fakeResponse(
            200,
            json_encode(['esearchresult' => ['errorlist' => ['PhraseNotFound' => ['xyz']]]]),
            ['Content-Type' => 'application/json']
        );

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_api_response_errors_throws_on_xml_error_tag(): void
    {
        $response = $this->fakeResponse(200, '<ERROR>invalid id</ERROR>', ['Content-Type' => 'application/xml']);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_api_response_errors_throws_on_xml_errorlist_tag(): void
    {
        $response = $this->fakeResponse(200, '<ErrorList><PhraseNotFound>xyz</PhraseNotFound></ErrorList>', ['Content-Type' => 'application/xml']);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_api_response_errors_does_not_throw_on_valid_json_response(): void
    {
        $response = $this->fakeResponse(200, json_encode(['esearchresult' => ['count' => '5']]), ['Content-Type' => 'application/json']);

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);

        $this->assertTrue(true); // sampai sini berarti tidak ada exception yang dilempar
    }

    public function test_handle_api_response_errors_does_not_throw_on_valid_xml_response(): void
    {
        $response = $this->fakeResponse(200, '<PubmedArticleSet></PubmedArticleSet>', ['Content-Type' => 'application/xml']);

        $this->callProtected($this->service, 'handleApiResponseErrors', [$response]);

        $this->assertTrue(true);
    }
}
