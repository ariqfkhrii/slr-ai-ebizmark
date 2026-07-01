<?php

namespace App\Services;

use App\Jobs\FetchOpenAlexPdfJob;
use App\Models\FilteredArticle;

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
}
