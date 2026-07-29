<?php

namespace Tests\Unit;

use App\Services\ScopusApiService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionClass;
use ReflectionMethod;
use Tests\TestCase;

class ScopusApiServiceTest extends TestCase
{
    protected ScopusApiService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new ScopusApiService();

        config([
            'services.scopus.key'      => 'dummy-api-key',
            'services.scopus.base_url' => 'https://api.elsevier.com/content/search/scopus',
        ]);

        // Bersihkan limiter key tiap test biar gak bocor state antar test
        RateLimiter::clear('scopus_api_limiter');
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Helper untuk memanggil method protected/private via reflection.
     */
    protected function invokeMethod(object $object, string $methodName, array $parameters = [])
    {
        $reflection = new ReflectionClass($object);
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);

        return $method->invokeArgs($object, $parameters);
    }

    /* =========================================================================
     |  buildScopusQuery()
     * ========================================================================= */

    public function test_build_query_multi_word_keyword_wraps_in_title_and_quotes_it(): void
    {
        $result = $this->service->buildScopusQuery('machine learning');

        $this->assertSame('TITLE("machine learning")', $result);
    }

    public function test_build_query_multi_word_already_quoted_does_not_double_quote(): void
    {
        $result = $this->service->buildScopusQuery('"machine learning"');

        $this->assertSame('TITLE("machine learning")', $result);
    }

    public function test_build_query_trims_surrounding_whitespace_before_processing(): void
    {
        $result = $this->service->buildScopusQuery('   machine learning   ');

        $this->assertSame('TITLE("machine learning")', $result);
    }

    public function test_build_query_single_word_uses_title_abs_key_branch(): void
    {
        $result = $this->service->buildScopusQuery('blockchain');

        $this->assertSame('TITLE-ABS-KEY(blockchain)', $result);
    }

    public function test_build_query_semicolon_separated_keywords_are_joined_with_and(): void
    {
        $result = $this->service->buildScopusQuery('AI;machine learning');

        // "AI" single word -> tidak di-quote; "machine learning" multi word -> di-quote
        $this->assertSame('TITLE-ABS-KEY(AI AND "machine learning")', $result);
    }

    public function test_build_query_semicolon_parts_are_trimmed_and_empty_parts_filtered(): void
    {
        $result = $this->service->buildScopusQuery('AI ; ; machine learning ;');

        $this->assertSame('TITLE-ABS-KEY(AI AND "machine learning")', $result);
    }

    public function test_build_query_leading_not_operator_on_first_part(): void
    {
        $result = $this->service->buildScopusQuery('!bias');

        $this->assertSame('TITLE-ABS-KEY(NOT bias)', $result);
    }

    public function test_build_query_not_operator_on_subsequent_part_uses_and_not(): void
    {
        $result = $this->service->buildScopusQuery('AI;!bias');

        $this->assertSame('TITLE-ABS-KEY(AI AND NOT bias)', $result);
    }

    public function test_build_query_not_operator_with_multi_word_part_is_quoted(): void
    {
        $result = $this->service->buildScopusQuery('AI;!systematic bias');

        $this->assertSame('TITLE-ABS-KEY(AI AND NOT "systematic bias")', $result);
    }

    public function test_build_query_multiple_not_and_positive_parts_combined_correctly(): void
    {
        $result = $this->service->buildScopusQuery('AI;!bias;machine learning;!overfitting');

        $this->assertSame(
            'TITLE-ABS-KEY(AI AND NOT bias AND "machine learning" AND NOT overfitting)',
            $result
        );
    }

    public function test_build_query_contains_exclamation_without_semicolon_still_uses_title_abs_key(): void
    {
        // Tidak ada ';' tapi ada '!' -> tetap masuk branch TITLE-ABS-KEY (bukan TITLE)
        $result = $this->service->buildScopusQuery('!bias');

        $this->assertStringStartsWith('TITLE-ABS-KEY(', $result);
    }

    public function test_build_query_single_part_already_quoted_is_not_double_quoted_in_and_branch(): void
    {
        $result = $this->service->buildScopusQuery('"machine learning";AI');

        $this->assertSame('TITLE-ABS-KEY("machine learning" AND AI)', $result);
    }

    /* =========================================================================
     |  enforceRateLimit()  [protected -> via reflection]
     * ========================================================================= */

    public function test_enforce_rate_limit_hits_limiter_immediately_when_under_threshold(): void
    {
        RateLimiter::shouldReceive('tooManyAttempts')
            ->once()
            ->with('scopus_api_limiter', 9)
            ->andReturn(false);

        RateLimiter::shouldReceive('hit')
            ->once()
            ->with('scopus_api_limiter', 1);

        $this->invokeMethod($this->service, 'enforceRateLimit');

        // Tidak ada assertion tambahan diperlukan; Mockery expectations
        // di atas otomatis diverifikasi lewat tearDown() -> Mockery::close().
        $this->addToAssertionCount(1);
    }

    public function test_enforce_rate_limit_waits_while_too_many_attempts_then_hits(): void
    {
        // Simulasikan: 2x kena limit, baru di percobaan ke-3 boleh lanjut
        RateLimiter::shouldReceive('tooManyAttempts')
            ->times(3)
            ->with('scopus_api_limiter', 9)
            ->andReturn(true, true, false);

        RateLimiter::shouldReceive('hit')
            ->once()
            ->with('scopus_api_limiter', 1);

        $start = microtime(true);
        $this->invokeMethod($this->service, 'enforceRateLimit');
        $elapsed = microtime(true) - $start;

        // 2 iterasi usleep(100000) = ~0.2 detik minimum
        $this->assertGreaterThanOrEqual(0.15, $elapsed);
    }

    /* =========================================================================
     |  handleApiResponseErrors()  [protected -> via reflection]
     * ========================================================================= */

    public function test_handle_errors_successful_response_does_not_throw(): void
    {
        Http::fake([
            '*' => Http::response(['ok' => true], 200),
        ]);

        $response = Http::get('https://api.elsevier.com/content/search/scopus');

        // Tidak boleh melempar exception apapun
        $this->invokeMethod($this->service, 'handleApiResponseErrors', [$response]);
        $this->addToAssertionCount(1);
    }

    #[DataProvider('authErrorStatusProvider')]
    public function test_handle_errors_401_403_throws_auth_error(int $status): void
    {
        Http::fake(['*' => Http::response(['message' => 'unauthorized'], $status)]);
        $response = Http::get('https://api.elsevier.com/content/search/scopus');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('AUTH_ERROR');

        $this->invokeMethod($this->service, 'handleApiResponseErrors', [$response]);
    }

    public static function authErrorStatusProvider(): array
    {
        return [
            'unauthorized (401)' => [401],
            'forbidden (403)'    => [403],
        ];
    }

    #[DataProvider('badRequestStatusProvider')]
    public function test_handle_errors_400_405_406_throws_bad_request(int $status): void
    {
        Http::fake(['*' => Http::response(['message' => 'bad request'], $status)]);
        $response = Http::get('https://api.elsevier.com/content/search/scopus');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->invokeMethod($this->service, 'handleApiResponseErrors', [$response]);
    }

    public static function badRequestStatusProvider(): array
    {
        return [
            'bad request (400)'         => [400],
            'method not allowed (405)'  => [405],
            'not acceptable (406)'      => [406],
        ];
    }

    public function test_handle_errors_429_throws_api_rate_limit(): void
    {
        Http::fake(['*' => Http::response(['message' => 'too many requests'], 429)]);
        $response = Http::get('https://api.elsevier.com/content/search/scopus');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('API_RATE_LIMIT');

        $this->invokeMethod($this->service, 'handleApiResponseErrors', [$response]);
    }

    #[DataProvider('serverErrorStatusProvider')]
    public function test_handle_errors_500_502_503_throws_server_error(int $status): void
    {
        Http::fake(['*' => Http::response(['message' => 'server error'], $status)]);
        $response = Http::get('https://api.elsevier.com/content/search/scopus');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('SERVER_ERROR');

        $this->invokeMethod($this->service, 'handleApiResponseErrors', [$response]);
    }

    public static function serverErrorStatusProvider(): array
    {
        return [
            'internal server error (500)' => [500],
            'bad gateway (502)'           => [502],
            'service unavailable (503)'   => [503],
        ];
    }

    public function test_handle_errors_unmapped_status_throws_unknown_api_error(): void
    {
        // 404 sengaja dipakai karena tidak ada di daftar match() manapun
        Http::fake(['*' => Http::response(['message' => 'not found'], 404)]);
        $response = Http::get('https://api.elsevier.com/content/search/scopus');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('UNKNOWN_API_ERROR');

        $this->invokeMethod($this->service, 'handleApiResponseErrors', [$response]);
    }

    public function test_handle_errors_logs_error_with_status_and_body_on_failure(): void
    {
        Http::fake(['*' => Http::response(['message' => 'boom'], 500)]);
        $response = Http::get('https://api.elsevier.com/content/search/scopus');

        Log::shouldReceive('error')
            ->once()
            ->withArgs(function (string $message, array $context) {
                return str_contains($message, 'Scopus API Error')
                    && str_contains($message, 'boom')
                    && ($context['status'] ?? null) === 500;
            });

        try {
            $this->invokeMethod($this->service, 'handleApiResponseErrors', [$response]);
        } catch (\Exception $e) {
            // Exception SERVER_ERROR diharapkan, yang penting Log::error terpanggil
        }

        $this->addToAssertionCount(1);
    }

    /* =========================================================================
     |  searchPreviewWithTotal()
     * ========================================================================= */

    public function test_search_preview_with_total_returns_total_and_entries_on_success(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => [
                    'opensearch:totalResults' => '42',
                    'entry' => [
                        ['dc:title' => 'Paper One'],
                        ['dc:title' => 'Paper Two'],
                    ],
                ],
            ], 200),
        ]);

        $result = $this->service->searchPreviewWithTotal('machine learning', 2020, 2024, 25);

        $this->assertSame(42, $result['total']);
        $this->assertCount(2, $result['entries']);
        $this->assertSame('Paper One', $result['entries'][0]['dc:title']);
    }

    public function test_search_preview_with_total_builds_query_with_correct_pubyear_range(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => ['opensearch:totalResults' => '0', 'entry' => []],
            ], 200),
        ]);

        $this->service->searchPreviewWithTotal('AI', 2020, 2023, 25);

        Http::assertSent(function (Request $request) {
            $query = $request['query'] ?? null;

            return str_contains($query, 'TITLE-ABS-KEY(AI)')
                && str_contains($query, 'PUBYEAR > 2019')
                && str_contains($query, 'PUBYEAR < 2024');
        });
    }

    public function test_search_preview_with_total_sends_correct_count_and_start_params(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => ['opensearch:totalResults' => '0', 'entry' => []],
            ], 200),
        ]);

        $this->service->searchPreviewWithTotal('AI', 2020, 2024, 10);

        Http::assertSent(function (Request $request) {
            return ($request['count'] ?? null) === 10
                && ($request['start'] ?? null) === 0;
        });
    }

    public function test_search_preview_with_total_defaults_to_empty_array_when_entry_missing(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => ['opensearch:totalResults' => '5'],
                // 'entry' sengaja dihilangkan
            ], 200),
        ]);

        $result = $this->service->searchPreviewWithTotal('AI', 2020, 2024);

        $this->assertSame(5, $result['total']);
        $this->assertSame([], $result['entries']);
    }

    public function test_search_preview_with_total_throws_when_api_returns_error(): void
    {
        Http::fake(['*' => Http::response(['message' => 'unauthorized'], 401)]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('AUTH_ERROR');

        $this->service->searchPreviewWithTotal('AI', 2020, 2024);
    }

    public function test_search_preview_with_total_sends_correct_api_key_header(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => ['opensearch:totalResults' => '0', 'entry' => []],
            ], 200),
        ]);

        $this->service->searchPreviewWithTotal('AI', 2020, 2024);

        Http::assertSent(function (Request $request) {
            return $request->hasHeader('X-ELS-APIKey', 'dummy-api-key');
        });
    }

    /* =========================================================================
     |  getTotalCount()
     * ========================================================================= */

    public function test_get_total_count_includes_pubyear_filter_when_years_provided(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => ['opensearch:totalResults' => '100'],
            ], 200),
        ]);

        $total = $this->service->getTotalCount('AI', 2019, 2022);

        $this->assertSame(100, $total);

        Http::assertSent(function (Request $request) {
            $query = $request['query'] ?? null;

            return str_contains($query, 'PUBYEAR > 2018')
                && str_contains($query, 'PUBYEAR < 2023');
        });
    }

    public function test_get_total_count_excludes_pubyear_filter_when_years_are_null(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => ['opensearch:totalResults' => '7'],
            ], 200),
        ]);

        $total = $this->service->getTotalCount('AI', null, null);

        $this->assertSame(7, $total);

        Http::assertSent(function (Request $request) {
            $query = $request['query'] ?? null;

            return ! str_contains($query, 'PUBYEAR');
        });
    }

    public function test_get_total_count_sends_count_of_one(): void
    {
        Http::fake([
            '*' => Http::response(['search-results' => ['opensearch:totalResults' => '0']], 200),
        ]);

        $this->service->getTotalCount('AI', null, null);

        Http::assertSent(function (Request $request) {
            return ($request['count'] ?? null) === 1;
        });
    }

    public function test_get_total_count_returns_zero_when_field_missing_from_response(): void
    {
        Http::fake([
            '*' => Http::response(['search-results' => []], 200),
        ]);

        $total = $this->service->getTotalCount('AI', null, null);

        $this->assertSame(0, $total);
    }

    public function test_get_total_count_throws_on_server_error(): void
    {
        Http::fake(['*' => Http::response(['message' => 'down'], 503)]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('SERVER_ERROR');

        $this->service->getTotalCount('AI', 2020, 2024);
    }

    /* =========================================================================
     |  search()
     * ========================================================================= */

    public function test_search_returns_entries_array_on_success(): void
    {
        Http::fake([
            '*' => Http::response([
                'search-results' => [
                    'entry' => [
                        ['dc:title' => 'Result A'],
                        ['dc:title' => 'Result B'],
                    ],
                ],
            ], 200),
        ]);

        $entries = $this->service->search('TITLE-ABS-KEY(AI)', 25, 0);

        $this->assertCount(2, $entries);
        $this->assertSame('Result A', $entries[0]['dc:title']);
    }

    public function test_search_returns_empty_array_when_no_entry_key_present(): void
    {
        Http::fake([
            '*' => Http::response(['search-results' => []], 200),
        ]);

        $entries = $this->service->search('TITLE-ABS-KEY(AI)', 25, 0);

        $this->assertSame([], $entries);
    }

    public function test_search_sends_provided_query_count_and_start(): void
    {
        Http::fake([
            '*' => Http::response(['search-results' => ['entry' => []]], 200),
        ]);

        $this->service->search('TITLE-ABS-KEY(AI)', 50, 100);

        Http::assertSent(function (Request $request) {
            return $request['query'] === 'TITLE-ABS-KEY(AI)'
                && $request['count'] === 50
                && $request['start'] === 100;
        });
    }

    public function test_search_throws_bad_request_on_400(): void
    {
        Http::fake(['*' => Http::response(['message' => 'invalid query'], 400)]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('BAD_REQUEST');

        $this->service->search('INVALID(((', 25, 0);
    }

    /* =========================================================================
     |  Integrasi ringan: memastikan rate limiter benar-benar dipanggil
     |  setiap kali method publik yang hit API dipanggil
     * ========================================================================= */

    public function test_search_calls_enforce_rate_limit_before_hitting_api(): void
    {
        Http::fake(['*' => Http::response(['search-results' => ['entry' => []]], 200)]);

        RateLimiter::shouldReceive('tooManyAttempts')
            ->once()
            ->with('scopus_api_limiter', 9)
            ->andReturn(false);

        RateLimiter::shouldReceive('hit')
            ->once()
            ->with('scopus_api_limiter', 1);

        $this->service->search('TITLE-ABS-KEY(AI)', 25, 0);

        $this->addToAssertionCount(1);
    }
}