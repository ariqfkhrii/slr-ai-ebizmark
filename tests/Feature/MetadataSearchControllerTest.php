<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\MetadataSearchServices;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class MetadataSearchControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->create([
            'email_verified_at' => now(),
        ]));
    }

    private function createKeywordId(string $keyword = 'artificial intelligence'): int
    {
        return DB::table('keywords')->insertGetId([
            'keyword' => $keyword,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function insertBatchRow(array $overrides = []): string
    {
        $id = (string) Str::uuid();

        DB::table('job_batches')->insert(array_merge([
            'id' => $id,
            'name' => 'Metadata Search Test Batch',
            'total_jobs' => 10,
            'pending_jobs' => 10,
            'failed_jobs' => 0,
            'failed_job_ids' => json_encode([]),
            'options' => serialize([]),
            'cancelled_at' => null,
            'created_at' => now()->timestamp,
            'finished_at' => null,
        ], $overrides));

        return $id;
    }

    // getPreview

    public function test_it_returns_preview_result_when_recommended(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andReturn([
                    'source' => 'scopus',
                    'total_count' => 250,
                    'is_recommended' => true,
                    'samples' => [],
                ]);
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Pratinjau hasil pencarian siap ditampilkan.',
                'can_execute' => true,
            ]);
    }

    public function test_it_returns_message_when_preview_article_count_is_too_low(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andReturn([
                    'source' => 'scopus',
                    'total_count' => 42,
                    'is_recommended' => false,
                    'samples' => [],
                ]);
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'can_execute' => false,
            ])
            ->assertJsonFragment([
                'message' => 'Artikel yang ditemukan terlalu sedikit (42). Minimal harus ada 100 artikel untuk melanjutkan pencarian.',
            ]);
    }

    public function test_it_returns_message_when_preview_article_count_exceeds_maximum(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andReturn([
                    'source' => 'scopus',
                    'total_count' => 7500,
                    'is_recommended' => false,
                    'samples' => [],
                ]);
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'can_execute' => false,
            ])
            ->assertJsonFragment([
                'message' => 'Pencarian tidak bisa dilanjutkan karena melebihi batas maksimal 5.000 artikel (ditemukan 7500). Silakan buat kata kunci atau judul yang lebih spesifik.',
            ]);
    }

    public function test_it_returns_validation_error_when_keyword_id_is_missing_on_preview(): void
    {
        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['keyword_id']);
    }

    public function test_it_returns_validation_error_when_end_year_is_before_start_year_on_preview(): void
    {
        $keywordId = $this->createKeywordId();

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2024,
            'end_year' => 2020,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_year']);
    }

    public function test_it_returns_rate_limit_error_on_preview(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andThrow(new \Exception('API_RATE_LIMIT'));
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(429)
            ->assertJsonFragment([
                'message' => 'Layanan penyedia data sedang sibuk (terlalu banyak permintaan). Mohon tunggu beberapa saat dan coba lagi.',
            ]);
    }

    public function test_it_returns_auth_error_on_preview(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andThrow(new \Exception('AUTH_ERROR'));
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(500)
            ->assertJsonFragment([
                'message' => 'Sistem tidak dapat terhubung ke penyedia data karena masalah akses. Silakan hubungi administrator.',
            ]);
    }

    public function test_it_returns_bad_request_error_on_preview(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andThrow(new \Exception('BAD_REQUEST'));
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(400)
            ->assertJsonFragment([
                'message' => 'Format pencarian tidak valid. Silakan periksa kembali format pencarian Anda.',
            ]);
    }

    public function test_it_returns_server_error_on_preview(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andThrow(new \Exception('SERVER_ERROR'));
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(500)
            ->assertJsonFragment([
                'message' => 'Layanan penyedia data sedang mengalami gangguan. Silakan coba lagi nanti.',
            ]);
    }

    public function test_it_returns_validation_error_when_start_year_is_missing_on_preview(): void
    {
        $keywordId = $this->createKeywordId();

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'end_year' => 2024,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_year']);
    }

    public function test_it_returns_validation_error_when_end_year_exceeds_current_year_on_preview(): void
    {
        $keywordId = $this->createKeywordId();

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => (int) date('Y') + 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_year']);
    }

    public function test_it_returns_validation_error_when_keyword_id_does_not_exist_on_preview(): void
    {
        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => 999999,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['keyword_id']);
    }

    public function test_it_requires_authentication_to_access_preview(): void
    {
        \Illuminate\Support\Facades\Auth::logout();

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => 1,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(401);
    }

    public function test_it_returns_generic_error_on_preview_for_unknown_exception(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('getPreviewResults')
                ->once()
                ->andThrow(new \Exception('SOMETHING_UNEXPECTED'));
        });

        $response = $this->postJson(route('metadata.preview', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
        ]);

        $response->assertStatus(500)
            ->assertJsonFragment([
                'message' => 'Sistem gagal memuat pratinjau pencarian. Silakan coba beberapa saat lagi.',
            ]);
    }

    // dispatchResult

    public function test_it_returns_full_cache_response_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn(['status' => 'full_cache', 'code' => 200]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Semua data artikel sudah tersedia dan siap ditampilkan.',
            ]);
    }

    public function test_it_returns_active_running_response_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn(['status' => 'active_running', 'batch_id' => 'batch-123', 'code' => 202]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'message' => 'Pencarian untuk kata kunci ini sedang diproses. Mohon tunggu sebentar.',
                'batch_id' => 'batch-123',
            ]);
    }

    public function test_it_returns_no_results_response_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn(['status' => 'no_results', 'code' => 404]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Tidak ada artikel yang ditemukan untuk kata kunci ini.',
            ]);
    }

    public function test_it_returns_dispatched_response_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn([
                    'status' => 'dispatched',
                    'batch_id' => 'batch-456',
                    'missed_sources' => ['pubmed'],
                    'code' => 202,
                ]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'message' => 'Pencarian mulai diproses.',
                'batch_id' => 'batch-456',
                'missed_sources' => ['pubmed'],
            ]);
    }

    public function test_it_returns_generic_error_for_unexpected_status_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn(['status' => 'weird_status', 'code' => 200]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(500)
            ->assertJson([
                'message' => 'Terjadi masalah yang tidak terduga pada status pencarian.',
                'status' => 'weird_status',
            ]);
    }

    public function test_it_returns_rate_limit_error_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andThrow(new \Exception('API_RATE_LIMIT'));
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(429)
            ->assertJsonFragment([
                'message' => 'Layanan penyedia data sedang sibuk. Mohon tunggu beberapa saat dan coba lagi.',
            ]);
    }

    public function test_it_returns_auth_error_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andThrow(new \Exception('AUTH_ERROR'));
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(500)
            ->assertJsonFragment([
                'message' => 'Sistem tidak dapat terhubung ke penyedia data karena masalah akses. Silakan hubungi administrator.',
            ]);
    }

    public function test_it_returns_bad_request_error_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andThrow(new \Exception('BAD_REQUEST'));
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(400)
            ->assertJsonFragment([
                'message' => 'Format pencarian tidak valid. Silakan periksa kembali format pencarian Anda.',
            ]);
    }

    public function test_it_returns_server_error_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andThrow(new \Exception('SERVER_ERROR'));
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(500)
            ->assertJsonFragment([
                'message' => 'Layanan penyedia data sedang mengalami gangguan. Silakan coba lagi nanti.',
            ]);
    }

    public function test_it_returns_generic_error_on_dispatch_for_unknown_exception(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andThrow(new \Exception('SOMETHING_UNEXPECTED'));
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(500)
            ->assertJsonFragment([
                'message' => 'Terjadi kesalahan tidak terduga saat memulai pencarian.',
            ]);
    }

    public function test_it_returns_validation_error_when_can_execute_is_not_accepted_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => false,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['can_execute']);
    }

    public function test_it_returns_validation_error_when_tier_value_is_invalid_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
            'tiers' => ['q9'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tiers.0']);
    }

    public function test_it_returns_validation_error_when_keyword_id_is_missing_on_dispatch(): void
    {
        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['keyword_id']);
    }

    public function test_it_accepts_valid_tiers_array_on_dispatch(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn(['status' => 'full_cache', 'code' => 200]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
            'tiers' => ['q1', 'q2'],
        ]);

        $response->assertStatus(200);
    }

    public function test_it_defaults_missed_sources_to_empty_array_when_not_provided_by_service(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn(['status' => 'dispatched', 'batch_id' => 'batch-789', 'code' => 202]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'missed_sources' => [],
            ]);
    }

    public function test_it_defaults_batch_id_to_null_when_not_provided_by_service_on_active_running(): void
    {
        $keywordId = $this->createKeywordId();

        $this->mock(MetadataSearchServices::class, function ($mock) {
            $mock->shouldReceive('executeSearch')
                ->once()
                ->andReturn(['status' => 'active_running', 'code' => 202]);
        });

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => $keywordId,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'batch_id' => null,
            ]);
    }

    public function test_it_requires_authentication_to_access_dispatch(): void
    {
        \Illuminate\Support\Facades\Auth::logout();

        $response = $this->postJson(route('metadata.execute', ['id' => 1]), [
            'keyword_id' => 1,
            'start_year' => 2020,
            'end_year' => 2024,
            'can_execute' => true,
        ]);

        $response->assertStatus(401);
    }

    // cancelSearch

    public function test_it_cancels_a_running_batch_successfully(): void
    {
        $batchId = $this->insertBatchRow();

        $response = $this->postJson(route('search.cancel', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Proses pencarian berhasil dibatalkan.',
                'batch_id' => $batchId,
            ]);

        $this->assertNotNull(DB::table('job_batches')->where('id', $batchId)->value('cancelled_at'));
    }

    public function test_it_returns_not_found_when_cancelling_a_nonexistent_batch(): void
    {
        $response = $this->postJson(route('search.cancel', ['batchId' => 'nonexistent-batch-id']));

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Proses pencarian tidak ditemukan.',
            ]);
    }

    public function test_it_returns_bad_request_when_cancelling_an_already_finished_batch(): void
    {
        $batchId = $this->insertBatchRow([
            'pending_jobs' => 0,
            'finished_at' => now()->timestamp,
        ]);

        $response = $this->postJson(route('search.cancel', ['batchId' => $batchId]));

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Pencarian yang sudah selesai tidak bisa dibatalkan.',
            ]);
    }

    public function test_it_cancels_a_batch_that_was_already_cancelled_without_error(): void
    {
        $batchId = $this->insertBatchRow([
            'cancelled_at' => now()->timestamp,
        ]);

        $response = $this->postJson(route('search.cancel', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Proses pencarian berhasil dibatalkan.',
                'batch_id' => $batchId,
            ]);
    }

    public function test_it_requires_authentication_to_access_cancel_search(): void
    {
        \Illuminate\Support\Facades\Auth::logout();

        $batchId = $this->insertBatchRow();

        $response = $this->postJson(route('search.cancel', ['batchId' => $batchId]));

        $response->assertStatus(401);
    }

    // batchProgress

    public function test_it_returns_progress_for_a_running_batch(): void
    {
        $batchId = $this->insertBatchRow([
            'total_jobs' => 10,
            'pending_jobs' => 4,
            'failed_jobs' => 0,
        ]);

        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'batch_id' => $batchId,
                'status' => 'running',
                'total_jobs' => 10,
                'pending_jobs' => 4,
                'processed_jobs' => 6,
                'failed_jobs' => 0,
                'percentage' => 60,
            ]);
    }

    public function test_it_returns_progress_for_a_completed_batch(): void
    {
        $batchId = $this->insertBatchRow([
            'total_jobs' => 10,
            'pending_jobs' => 0,
            'failed_jobs' => 0,
            'finished_at' => now()->timestamp,
        ]);

        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'completed',
                'processed_jobs' => 10,
                'percentage' => 100,
            ]);
    }

    public function test_it_returns_progress_for_a_completed_batch_with_errors(): void
    {
        $batchId = $this->insertBatchRow([
            'total_jobs' => 10,
            'pending_jobs' => 0,
            'failed_jobs' => 2,
            'finished_at' => now()->timestamp,
        ]);

        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'completed_with_errors',
                'failed_jobs' => 2,
            ]);
    }

    public function test_it_returns_progress_for_a_cancelled_batch(): void
    {
        $batchId = $this->insertBatchRow([
            'total_jobs' => 10,
            'pending_jobs' => 5,
            'cancelled_at' => now()->timestamp,
        ]);

        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'cancelled',
            ]);
    }

    public function test_it_returns_not_found_when_batch_progress_does_not_exist(): void
    {
        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => 'nonexistent-batch-id']));

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Proses pencarian tidak ditemukan.',
            ]);
    }

    public function test_it_returns_zero_percentage_when_total_jobs_is_zero(): void
    {
        $batchId = $this->insertBatchRow([
            'total_jobs' => 0,
            'pending_jobs' => 0,
            'failed_jobs' => 0,
        ]);

        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'running',
                'total_jobs' => 0,
                'processed_jobs' => 0,
                'percentage' => 0,
            ]);
    }

    public function test_it_prioritizes_cancelled_status_over_finished_status(): void
    {
        $batchId = $this->insertBatchRow([
            'total_jobs' => 10,
            'pending_jobs' => 0,
            'failed_jobs' => 1,
            'cancelled_at' => now()->timestamp,
            'finished_at' => now()->timestamp,
        ]);

        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => $batchId]));

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'cancelled',
            ]);
    }

    public function test_it_requires_authentication_to_access_batch_progress(): void
    {
        \Illuminate\Support\Facades\Auth::logout();

        $batchId = $this->insertBatchRow();

        $response = $this->getJson(route('metadata.batch-progress', ['batchId' => $batchId]));

        $response->assertStatus(401);
    }
}