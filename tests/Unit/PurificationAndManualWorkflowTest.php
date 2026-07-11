<?php

namespace Tests\Unit;

use App\Jobs\FetchOpenAlexPdfJob;
use App\Models\ArticleClassification;
use App\Models\ClassificationSetup;
use App\Models\Extraction;
use App\Models\FilteredArticle;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Models\Review;
use App\Models\User;
use App\Services\ClassificationService;
use App\Services\ExtractionService;
use App\Services\FilteredArticleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class PurificationAndManualWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected FilteredArticleService $filteredArticleService;

    protected ExtractionService $extractionService;

    protected ClassificationService $classificationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->filteredArticleService = new FilteredArticleService();
        $this->extractionService = new ExtractionService();
        $this->classificationService = new ClassificationService();
    }

    public function test_it_updates_include_status_for_a_single_article(): void
    {
        [$user, $researchPlan, $article] = $this->createPlanAndArticle();

        $result = $this->filteredArticleService->updateIncludedStatus($article->id, false);

        $this->assertFalse($result->fresh()->included);
        $this->assertDatabaseHas('filtered_articles', [
            'id' => $article->id,
            'included' => false,
            'research_plan_id' => $researchPlan->research_plan_id,
        ]);
    }

    public function test_it_updates_include_status_for_all_articles_in_a_research_plan(): void
    {
        [$user, $researchPlan, $articleOne, $articleTwo] = $this->createPlanAndArticles();

        $this->filteredArticleService->updateAllIncludedStatus($researchPlan->research_plan_id, false);

        $this->assertDatabaseHas('filtered_articles', ['id' => $articleOne->id, 'included' => false]);
        $this->assertDatabaseHas('filtered_articles', ['id' => $articleTwo->id, 'included' => false]);
    }

    public function test_it_bulk_updates_selected_articles_only(): void
    {
        [$user, $researchPlan, $articleOne, $articleTwo, $articleThree] = $this->createPlanAndArticles(3);

        $this->filteredArticleService->bulkUpdateIncludedStatus([$articleOne->id, $articleTwo->id], false);

        $this->assertDatabaseHas('filtered_articles', ['id' => $articleOne->id, 'included' => false]);
        $this->assertDatabaseHas('filtered_articles', ['id' => $articleTwo->id, 'included' => false]);
        $this->assertDatabaseHas('filtered_articles', ['id' => $articleThree->id, 'included' => true]);
    }

    public function test_it_triggers_full_text_retrieval_for_included_article(): void
    {
        [$user, $researchPlan, $article] = $this->createPlanAndArticle();

        Bus::fake();

        $dispatched = $this->filteredArticleService->triggerOpenAlexFetch($article->id);

        $this->assertTrue($dispatched);
        Bus::assertDispatched(FetchOpenAlexPdfJob::class);
    }

    public function test_it_skips_full_text_retrieval_for_non_included_article(): void
    {
        [$user, $researchPlan, $article] = $this->createPlanAndArticle();
        $article->update(['included' => false]);

        Bus::fake();

        $dispatched = $this->filteredArticleService->triggerOpenAlexFetch($article->id);

        $this->assertFalse($dispatched);
        Bus::assertNotDispatched(FetchOpenAlexPdfJob::class);
    }

    public function test_it_saves_manual_extraction_for_filtered_article(): void
    {
        [$user, $researchPlan, $article] = $this->createPlanAndArticle();

        $result = $this->extractionService->upsert($article->id, $user->id, [
            'abstract' => 'Abstrak uji coba',
            'introduction' => 'Pendahuluan uji coba',
            'result' => 'Hasil uji coba',
            'conclusion' => 'Kesimpulan uji coba',
            'recommendation' => 'Rekomendasi uji coba',
            'novelty_gap' => 'Kesenjangan uji coba',
            'future_research' => 'Penelitian lanjutan',
            'limitation' => 'Keterbatasan uji coba',
        ]);

        $this->assertInstanceOf(Extraction::class, $result);
        $this->assertSame('manual', $result->input_method);
        $this->assertDatabaseHas('extraction_result', [
            'review_id' => $result->review_id,
            'abstract' => 'Abstrak uji coba',
        ]);
    }

    public function test_it_updates_existing_manual_extraction_for_filtered_article(): void
    {
        [$user, $researchPlan, $article] = $this->createPlanAndArticle();

        $first = $this->extractionService->upsert($article->id, $user->id, ['abstract' => 'Versi awal']);
        $second = $this->extractionService->upsert($article->id, $user->id, ['abstract' => 'Versi diperbarui']);

        $this->assertSame($first->review_id, $second->review_id);
        $this->assertSame('Versi diperbarui', $second->fresh()->abstract);
    }

    public function test_it_saves_manual_classification_setup_and_article_classification(): void
    {
        [$user, $researchPlan, $article] = $this->createPlanAndArticle();

        $setup = $this->classificationService->upsertSetup($researchPlan->research_plan_id, $user->id, [
            'category_1' => 'Kategori 1',
            'category_2' => 'Kategori 2',
            'theory' => 'Teori uji coba',
        ]);

        $classification = $this->classificationService->updateClassification($article->id, $user->id, [
            'research_method' => 'kualitatif',
            'category_1' => 'Klasifikasi A',
            'category_2' => 'Klasifikasi B',
        ]);

        $this->assertInstanceOf(ClassificationSetup::class, $setup);
        $this->assertSame('Kategori 1', $setup->fresh()->category_1);
        $this->assertInstanceOf(ArticleClassification::class, $classification);
        $this->assertSame('kualitatif', $classification->research_method);
        $this->assertDatabaseHas('article_classification', [
            'review_id' => $classification->review_id,
            'research_method' => 'kualitatif',
        ]);
    }

    private function createPlanAndArticle(): array
    {
        return $this->createPlanAndArticles(1);
    }

    private function createPlanAndArticles(int $count = 2): array
    {
        $user = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $user->id]);
        $keyword = Keyword::factory()->create();

        $articles = [];
        for ($i = 0; $i < $count; $i++) {
            $rawArticle = RawArticle::create([
                'doi' => '10.1000/test-'.$i,
                'title' => 'Judul artikel '.$i,
                'abstract' => 'Abstract artikel '.$i,
                'publish_year' => 2024,
                'source_db' => 'scopus',
            ]);

            $article = FilteredArticle::create([
                'research_plan_id' => $researchPlan->research_plan_id,
                'raw_article_id' => $rawArticle->id,
                'keyword_id' => $keyword->id,
                'similarity_score' => 0.75,
                'included' => true,
                'retrieved' => false,
            ]);

            $articles[] = $article;
        }

        return array_merge([$user, $researchPlan], $articles);
    }
}
