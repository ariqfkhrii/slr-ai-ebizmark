<?php

namespace App\Services;

use App\Models\FilteredArticle;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Services\Embedding\EmbeddingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class OtherSourceIngestService
{
    public function __construct(
        protected EmbeddingService $embeddingService
    ) {
    }

    public function store(
        ResearchPlan $researchPlan,
        array $data
    ): array {
        $pdfPath = $data['pdf']->store(
            'pdfs/other-source',
            'public'
        );

        try {

            $embedding = $this->embeddingService
                ->generate($data['title']);

            DB::beginTransaction();

            $rawArticle = RawArticle::create([
                'doi'            => $data['doi'] ?? null,
                'title'          => $data['title'],
                'authors'        => $data['authors'] ?? null,
                'keyword'        => $data['article_keyword'],
                'abstract'       => $data['abstract'] ?? null,
                'tier'           => $data['tier'] ?? null,
                'citation_count' => $data['citation_count'] ?? null,
                'publish_year'   => $data['publish_year'] ?? null,
                'source_db'      => 'other-source',
                'embedding'      => $embedding,
            ]);

            $filteredArticle = FilteredArticle::create([
                'research_plan_id' => $researchPlan->research_plan_id,
                'raw_article_id'   => $rawArticle->id,
                'keyword_id'       => $data['research_plan_keyword_id'],

                'included'         => true,
                'retrieved'        => true,

                'pdf_path'         => $pdfPath,
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Other source uploaded successfully.',
                'data' => [
                    'raw_article_id' => $rawArticle->id,
                    'filtered_article_id' => $filteredArticle->id,
                ],
            ];

        } catch (Throwable $e) {

            DB::rollBack();

            Storage::disk('public')->delete($pdfPath);

            throw $e;
        }
    }
}