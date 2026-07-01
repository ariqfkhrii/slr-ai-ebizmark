<?php

namespace App\Services;

use App\Jobs\CalculateArticleSimilarityJob;
use App\Jobs\FetchOpenAlexPdfJob;
use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use Illuminate\Support\Facades\Bus;

class FilteredArticleService
{
    public function getAllArticles(int $planId)
    {
        return FilteredArticle::query()
            ->where('research_plan_id', $planId)
            ->with([
                'rawArticle:id,doi,title,authors,keyword,abstract,tier,citation_count,publish_year'
            ])
            ->get();
    }

    public function getPaginatedArticles(
        int $planId,
        ?int $keywordId,
        int $size,
        ?string $search = null,
        ?bool $included = null,
        ?int $yearFrom = null,
        ?int $yearTo = null,
        ?array $tiers = null,
        ?string $sort = null,
    ) {
        return FilteredArticle::query()
            ->where('research_plan_id', $planId)

            ->when($keywordId, fn ($q) =>
                $q->where('keyword_id', $keywordId)
            )

            ->when($included !== null, fn ($q) =>
                $q->where('included', $included)
            )

            ->when($search, fn ($q) =>
                $q->whereHas('rawArticle', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                    ->orWhere('doi', 'like', "%{$search}%");
                })
            )

            ->when($yearFrom, fn ($q) =>
                $q->whereHas('rawArticle', fn ($q2) =>
                    $q2->where('publish_year', '>=', $yearFrom)
                )
            )

            ->when($yearTo, fn ($q) =>
                $q->whereHas('rawArticle', fn ($q2) =>
                    $q2->where('publish_year', '<=', $yearTo)
                )
            )

            ->when($tiers && count($tiers) > 0, fn ($q) =>
                $q->whereHas('rawArticle', function ($q) use ($tiers) {
                    $q->whereIn('tier', $tiers);
                })
            )

            ->when($sort === 'relevance', fn ($q) =>
                $q->orderByDesc('similarity_score')
            )

            ->with('rawArticle:id,doi,title,authors,keyword,abstract,tier,citation_count,publish_year')
            ->paginate($size);
    }

    public function updateIncludedStatus(int $id, bool $included)
    {
        $filteredArticle = FilteredArticle::findOrFail($id);
        
        $filteredArticle->update([
            'included' => $included
        ]);

        // Auto-dispatch background OpenAlex fetch when article is included and has no PDF yet
        if ($included && ! $filteredArticle->pdf_path) {
            dispatch(new FetchOpenAlexPdfJob($filteredArticle->id));
        }

        return $filteredArticle;
    }

    public function updateAllIncludedStatus(int $researchPlanId, bool $included)
    {
        FilteredArticle::query()
            ->where('research_plan_id', $researchPlanId)
            ->update([
                'included' => $included,
            ]);

        // Dispatch fetch jobs for all newly included articles that still lack a PDF
        if ($included) {
            FilteredArticle::query()
                ->where('research_plan_id', $researchPlanId)
                ->whereNull('pdf_path')
                ->select('id')
                ->each(function (FilteredArticle $article) {
                    dispatch(new FetchOpenAlexPdfJob($article->id));
                });
        }
    }

    /**
     * Manually trigger an OpenAlex PDF fetch for a single article.
     */
    public function triggerOpenAlexFetch(int $id): void
    {
        $filteredArticle = FilteredArticle::findOrFail($id);

        dispatch(new FetchOpenAlexPdfJob($filteredArticle->id));
    }

    /**
     * Manually trigger OpenAlex PDF fetch for all un-retrieved articles in a plan.
     */
    public function triggerAllOpenAlexFetch(int $researchPlanId): int
    {
        $articles = FilteredArticle::query()
            ->where('research_plan_id', $researchPlanId)
            ->where(function ($query) {
                $query->whereNull('pdf_path')
                      ->orWhere('retrieved', false);
            })
            ->select('id')
            ->get();

        foreach ($articles as $article) {
            dispatch(new FetchOpenAlexPdfJob($article->id));
        }

        return $articles->count();
    }

    public function bulkUpdateIncludedStatus(array $articleIds, bool $included)
    {
        FilteredArticle::query()
            ->whereIn('id', $articleIds)
            ->update([
                'included' => $included,
            ]);

        if ($included) {
            FilteredArticle::query()
                ->whereIn('id', $articleIds)
                ->whereNull('pdf_path')
                ->select('id')
                ->each(function (FilteredArticle $article) {
                    dispatch(new FetchOpenAlexPdfJob($article->id));
                });
        }
    }

    /**
     * Dispatch a batch job to calculate similarity scores for all articles in a research plan.
     *
     * @param int $planId
     * @return string The batch ID for tracking the job.
     */
    public function dispatchRelevanceCalculation(int $planId): string
    {
        $this->ensureEmbeddingsAreReady($planId);

        $researchPlan = ResearchPlan::with('keywords')->findOrFail($planId);
        $jobs = [];

        FilteredArticle::with('rawArticle')
            ->where('research_plan_id', $planId)
            ->chunkById(500, function ($chunk) use ($researchPlan, &$jobs) {
                $jobs[] = new CalculateArticleSimilarityJob($chunk, $researchPlan);
            });

        $batch = Bus::batch($jobs)
            ->name('Ranking Plan: ' . $planId)
            ->onQueue('similarity-calculation')
            ->dispatch();

        return $batch->id;
    }

    /**
     * Ensure that all necessary embeddings are present before calculating similarity.
     *
     * @param int $planId
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    private function ensureEmbeddingsAreReady(int $planId): void
    {
        $researchPlan = ResearchPlan::findOrFail($planId);

        if ($researchPlan->keywords()->count() === 0) {
            abort(400, 'Research plan ini belum memiliki keyword.');
        }

        $missingKeywordEmbeddings = $researchPlan->keywords()->whereNull('embedding')->exists();
        if ($missingKeywordEmbeddings) {
            abort(400, 'Terdapat keyword yang belum memiliki data embedding.');
        }

        $missingArticleEmbeddings = FilteredArticle::where('research_plan_id', $planId)
            ->whereHas('rawArticle', function ($query) {
                $query->whereNull('embedding');
            })->exists();

        if ($missingArticleEmbeddings) {
            abort(400, 'Terdapat artikel yang belum memiliki data embedding.');
        }
    }
}
