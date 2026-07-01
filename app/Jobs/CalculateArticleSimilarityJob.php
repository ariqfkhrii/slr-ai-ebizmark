<?php

namespace App\Jobs;

use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use App\Services\SimilarityService;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class CalculateArticleSimilarityJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Collection $articlesChunk;
    protected ResearchPlan $researchPlan;

    public function __construct(Collection $articlesChunk, ResearchPlan $researchPlan)
    {
        $this->articlesChunk = $articlesChunk;
        $this->researchPlan = $researchPlan;
    }

    public function handle(SimilarityService $similarityService)
    {
        $keywords = $this->researchPlan->keywords;
        $updatePayload = [];

        foreach ($this->articlesChunk as $article) {
            $articleVector = $article->rawArticle->embedding; 
            $scores = [];
            
            foreach ($keywords as $keyword) {
                $scores[] = $similarityService->calculateCosine($articleVector, $keyword->embedding);
            }
            
            $finalScore = min($scores);
            
            $updatePayload[] = [
                'id'               => $article->id,
                'research_plan_id' => $article->research_plan_id,
                'raw_article_id'   => $article->raw_article_id,
                'keyword_id'       => $article->keyword_id, 
                'similarity_score' => $finalScore,
            ];
        }

        FilteredArticle::upsert(
            $updatePayload,
            ['id'],
            ['similarity_score']
        );
    }
}
