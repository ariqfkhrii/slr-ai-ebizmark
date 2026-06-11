<?php

namespace App\Services;

use App\Enums\ArticleTempStatus;
use App\Jobs\FetchPubMedJob;
use App\Jobs\FetchScopusJob;
use App\Models\ArticleMetadataTemp;
use App\Models\FilteredArticle;
use App\Models\Keyword;
use App\Models\ResearchPlan;
use App\Models\ResearchPlanKeyword;
use App\Models\ScimagoJournal;
use App\Services\PubMedApiService;
use App\Services\ScopusApiService;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;

class MetadataSearchServices
{
    public function __construct(
        protected ScopusApiService $scopusApi,
        protected PubMedApiService $pubmedApi
    ) {}

    /**
     * Get preview results for a given keyword and parameters.
     *
     * @param int|string $researchPlanId
     * @param array $validatedData
     * @return array
     */
    public function getPreviewResults(array $validatedData, $researchPlanId): array
    {
        $keywordModel = Keyword::findOrFail($validatedData['keyword_id']);
        
        $researchPlan = ResearchPlan::findOrFail($researchPlanId);
        
        $source = $researchPlan->source_database;
        
        $params = [
            'keywordText' => $keywordModel->keyword,
            'startYear'   => $validatedData['start_year'],
            'endYear'     => $validatedData['end_year'],
            'source'      => $source
        ];

        $cacheKey = "preview:kw:{$keywordModel->id}:yr:{$params['startYear']}-{$params['endYear']}:src:{$params['source']}";

        return Cache::remember($cacheKey, now()->endOfDay(), function () use ($params) {
            $result = $this->fetchDataFromSource($params);

            return [
                'source'         => $params['source'],
                'total_count'    => $result['totalCount'],
                'is_recommended' => $result['totalCount'] >= 100 && $result['totalCount'] <= 5000,
                'samples'        => $result['samples'],
            ];
        });
    }

    /**
     * Fetch data from the appropriate source based on parameters.
     *
     * @param array $params
     * @return array
     */
    private function fetchDataFromSource(array $params): array
    {
        if ($params['source'] === 'scopus') {
            return $this->processScopusPreview($params);
        } 
        
        if ($params['source'] === 'pubmed') {
            return $this->processPubMedPreview($params);
        }

        return ['totalCount' => 0, 'samples' => []];
    }

    /**
     * Handle the Scopus-specific API calls and formatting.
     * 
     * @param array $params
     * @return array
     */
    private function processScopusPreview(array $params): array
    {
        $scopusData = $this->scopusApi->searchPreviewWithTotal(
            $params['keywordText'], $params['startYear'], $params['endYear'], 25
        );
        
        $totalCount = $scopusData['total'] ?? 0;
        $samples = [];
        
        if (!empty($scopusData['entries'])) {
            $samples = $this->formatScopusSamples($scopusData['entries']);
        }

        return ['totalCount' => $totalCount, 'samples' => $samples];
    }

    /**
     * Handle the PubMed-specific API calls and formatting.
     * 
     * @param array $params
     * @return array
     */
    private function processPubMedPreview(array $params): array
    {
        $pubMedData = $this->pubmedApi->searchIdsPreviewWithTotal(
            $params['keywordText'], $params['startYear'], $params['endYear'], 25
        );
        
        $totalCount = $pubMedData['total'] ?? 0;
        $samples = [];
        
        if (!empty($pubMedData['ids'])) {
            $rawSamples = $this->pubmedApi->fetchDetails($pubMedData['ids']);
            $rawCitations = $this->pubmedApi->fetchCitations($pubMedData['ids']);
            $citationCounts = $this->parsePubMedCitations($rawCitations);

            $samples = $this->formatPubMedSamples($rawSamples, $citationCounts);
        }

        return ['totalCount' => $totalCount, 'samples' => $samples];
    }

    /**
     * Format raw Scopus API entries into a structured format for preview.
     *
     * @param array $rawSamples
     * @return array
     */
    private function formatScopusSamples(array $rawSamples): array
    {
        $issns = [];

        // Extract ISSNs from the raw samples to query Scimago for journal tiers
        foreach ($rawSamples as $item) {
            if (!empty($item['prism:issn'])) {
                $issns[] = $item['prism:issn'];
            }
            if (!empty($item['prism:eIssn'])) {
                $issns[] = $item['prism:eIssn'];
            }
        }
        $uniqueIssns = array_unique($issns);

        $tierMap = [];

        // Query ScimagoJournal for the best quartile based on ISSNs
        if (!empty($uniqueIssns)) {
            $journals = ScimagoJournal::whereIn('issn_print', $uniqueIssns)
                ->orWhereIn('issn_e', $uniqueIssns)
                ->get(['issn_print', 'issn_e', 'best_quartile']);

            // Build a mapping of ISSN to best quartile for quick lookup
            foreach ($journals as $journal) {
                if ($journal->issn_print) {
                    $tierMap[$journal->issn_print] = $journal->best_quartile;
                }
                if ($journal->issn_e) {
                    $tierMap[$journal->issn_e] = $journal->best_quartile;
                }
            }
        }

        return collect($rawSamples)->map(function ($item) use ($tierMap) {
            $issn = $item['prism:issn'] ?? null;
            $eIssn = $item['prism:eIssn'] ?? null;

            $tier = 'Unranked';
            if ($issn && isset($tierMap[$issn])) {
                $tier = $tierMap[$issn];
            } elseif ($eIssn && isset($tierMap[$eIssn])) {
                $tier = $tierMap[$eIssn];
            }

            return [
                'title'          => $item['dc:title'] ?? 'No Title',
                'year'           => isset($item['prism:coverDate']) ? substr($item['prism:coverDate'], 0, 4) : null,
                'authors'        => $item['dc:creator'] ?? 'Unknown Author',
                'tier'           => $tier,
                'citation_count' => isset($item['citedby-count']) ? (int) $item['citedby-count'] : 0,
            ];
        })->toArray();
    }

    /**
     * Parse PubMed citations from XML string.
     *
     * @param string $xmlString
     * @return array
     */
    private function parsePubMedCitations(string $xmlString): array
    {
        if (empty($xmlString)) {
            return [];
        }

        $xml = simplexml_load_string($xmlString);
        if (!$xml) {
            return [];
        }

        $counts = [];

        // Iterate through each LinkSet in the XML to extract PMIDs and their corresponding citation counts
        foreach ($xml->LinkSet as $linkSet) {
            $pmid = (string) $linkSet->IdList->Id;
            $citationCount = 0;

            // Check if the LinkSet contains LinkSetDb elements and look for the 'pubmed_pubmed_citedin' link to count citations
            if (isset($linkSet->LinkSetDb)) {
                foreach ($linkSet->LinkSetDb as $db) {
                    if ((string) $db->LinkName === 'pubmed_pubmed_citedin') {
                        $citationCount = count($db->Link);
                        break;
                    }
                }
            }

            $counts[$pmid] = $citationCount;
        }

        return $counts;
    }

    /**
     * Formats raw PubMed XML data into a standardized array of article samples.
     *
     * Parses the XML string to extract key information such as the article's title, 
     * publication year, and authors. It also maps each article's PMID to its 
     * corresponding citation count.
     *
     * @param string $xmlString      The raw XML response from the PubMed API.
     * @param array  $citationCounts An associative array mapping PMIDs to their citation counts.
     * @return array A list of formatted article samples containing title, year, authors, tier, and citation count.
     */
    private function formatPubMedSamples(string $xmlString, array $citationCounts = []): array
    {
        if (empty($xmlString)) {
            return [];
        }

        $xml = simplexml_load_string($xmlString);
        if (!$xml) {
            return [];
        }

        $samples = [];

        // Iterate through each PubmedArticle in the XML to extract relevant information for the preview samples
        foreach ($xml->PubmedArticle as $article) {
            $medlineCitation = $article->MedlineCitation;
            $articleData = $medlineCitation->Article;

            $pmid = (string) $medlineCitation->PMID;

            $title = (string) $articleData->ArticleTitle;

            $year = (string) $articleData->Journal->JournalIssue->PubDate->Year;
            if (!$year && isset($articleData->Journal->JournalIssue->PubDate->MedlineDate)) {
                $year = substr((string) $articleData->Journal->JournalIssue->PubDate->MedlineDate, 0, 4);
            }

            $authorNames = [];
            // Extract author names from the AuthorList, combining LastName and Initials for each author
            if (isset($articleData->AuthorList->Author)) {
                foreach ($articleData->AuthorList->Author as $author) {
                    $lastName = (string) $author->LastName;
                    $initials = (string) $author->Initials;
                    if ($lastName) {
                        $authorNames[] = trim("$lastName $initials");
                    }
                }
            }
            $authors = empty($authorNames) ? 'Unknown Author' : implode(', ', $authorNames);

            $samples[] = [
                'title'          => $title ?: 'No Title',
                'year'           => $year ?: null,
                'authors'        => $authors,
                'tier'           => null,
                'citation_count' => $citationCounts[$pmid] ?? 0, 
            ];
        }

        return $samples;
    }
    
    /**
     * Execute metadata search based on validated request parameters.
     *
     * @param array $validatedRequest
     * @param int|string $planId
     * @return array
     */
    public function executeSearch(array $validatedRequest, $planId): array
    {
        $keywordId = $validatedRequest['keyword_id'];
        
        $plan = ResearchPlan::findOrFail($planId);
        $source = $plan->source_database;

        $cacheKeys = $this->generateCacheKeys($validatedRequest, $source);
        $hits      = $this->checkCacheHits($cacheKeys);

        if (count($hits) === count($cacheKeys)) {
            return ['status' => 'full_cache', 'code' => 200];
        }

        $activeBatchId = $this->getActiveBatchId($planId, $keywordId);
        if ($activeBatchId) {
            return ['status' => 'active_running', 'batch_id' => $activeBatchId, 'code' => 202];
        }

        $batchId = $this->dispatchSearchJobs($validatedRequest, $source, $cacheKeys, $planId);

        if (!$batchId) {
            return ['status' => 'no_results', 'code' => 404];
        }

        $this->rememberActiveBatch($planId, $keywordId, $batchId);

        return ['status' => 'dispatched', 'batch_id' => $batchId, 'source' => $source, 'code' => 202];
    }

    /**
     * Generate cache keys based on request parameters.
     *
     * @param array $validatedRequest
     * @param string $source
     * @return array
     */
    public function generateCacheKeys(array $validatedRequest, string $source): array
    {
        $keywordId = $validatedRequest['keyword_id'];
        $startYear = $validatedRequest['start_year'];
        $endYear = $validatedRequest['end_year'];
        $tiers = $validatedRequest['tiers'] ?? [];

        if ($source === 'pubmed') {
            $tierPart = 'tier:all:';
        } else {
            if (!empty($tiers)) {
                $tierPart = 'tier:' . implode(',', $tiers) . ':';
            } else {
                $tierPart = 'tier:all:';
            }
        }

        $key = "search:kw:{$keywordId}:yr:{$startYear}-{$endYear}:";
        $key .= $tierPart;
        $key .= "src:{$source}";

        return [$key];
    }

    /**
     * Check cache hits for given cache keys.
     *
     * @param array $cacheKeys
     * @return array
     */
    public function checkCacheHits(array $cacheKeys): array
    {
        $hits = [];
        foreach ($cacheKeys as $key) {
            $value = cache()->get($key);
            if (!is_null($value)) {
                $hits[$key] = $value;
            }
        }
        return $hits;
    }

    /**
     * Get active batch ID for a given research plan and keyword.
     *
     * @param int $researchPlanId
     * @param int $keywordId
     * @return string|null
     */
    public function getActiveBatchId(int $researchPlanId, int $keywordId): ?string
    {
        $cacheKey = "active_search_plan_{$researchPlanId}_kw_{$keywordId}";
        $batchIds = cache()->get($cacheKey);

        if (!$batchIds) return null;

        $anyRunning = collect(explode(',', $batchIds))
            ->filter(fn($id) => !empty($id))
            ->some(function ($id) {
                $batch = Bus::findBatch($id);
                return $batch && !$batch->finished();
            });

        if ($anyRunning) return $batchIds;

        cache()->forget($cacheKey);
        return null;
    }

    /**
     * Remember active batch ID in cache for a given research plan and keyword.
     *
     * @param int $researchPlanId
     * @param int $keywordId
     * @param string $batchId
     * @return void
     */
    public function rememberActiveBatch(int $researchPlanId, int $keywordId, string $batchId): void
    {
        cache()->put("active_search_plan_{$researchPlanId}_kw_{$keywordId}", $batchId, now()->addHours(1));
    }

    /**
     * Dispatch search jobs for missed sources and manage batch processing.
     *
     * @param array $validatedRequest
     * @param string $source
     * @param array $cacheKeys
     * @param int|string $planId
     * @return string|null
     */
    public function dispatchSearchJobs(array $validatedRequest, string $source, array $cacheKeys, $planId)
    {
        $keywordId = $validatedRequest['keyword_id'];

        $keywordModel  = Keyword::findOrFail($keywordId);
        $keywordString = $keywordModel->keyword;

        $startYear = $validatedRequest['start_year'];
        $endYear   = $validatedRequest['end_year'];

        $jobs = [];

        // Make jobs per source based on missed sources
        $cacheKey = $cacheKeys[0];

        $itemsPerPage = 25;
        $pagesPerJob  = 0;
        $totalCount   = 0;

        $totalWithYear = 0;
        $totalWithoutYear = 0;

        if ($source === 'scopus') {
            $pagesPerJob = 5;
            $totalWithYear = $this->scopusApi->getTotalCount($keywordString, $startYear, $endYear);
            $totalWithoutYear = $this->scopusApi->getTotalCount($keywordString, null, null);
            $totalCount  = min($totalWithYear, 5000);
        } elseif ($source === 'pubmed') {
            $pagesPerJob = 20;
            $totalWithYear = $this->pubmedApi->getTotalCount($keywordString, $startYear, $endYear);
            $totalWithoutYear = $this->pubmedApi->getTotalCount($keywordString, null, null);
            $totalCount  = min($totalWithYear, 5000);
        }

        $outOfYearRangeCount = max(0, $totalWithoutYear - $totalWithYear);

        ResearchPlanKeyword::where('research_plan_id', $planId)
            ->where('keyword_id', $keywordId)
            ->update(['out_of_year_range_count' => $outOfYearRangeCount]);

        if ($totalCount === 0) return null;

        $totalPages = (int) ceil($totalCount / $itemsPerPage);

        // Make jobs per page range
        for ($startPage = 1; $startPage <= $totalPages; $startPage += $pagesPerJob) {
            $endPage = min($startPage + $pagesPerJob - 1, $totalPages);

            if ($source === 'scopus') {
                $jobs[] = new FetchScopusJob($validatedRequest, $startPage, $endPage, $cacheKey);
            } elseif ($source === 'pubmed') {
                $jobs[] = new FetchPubMedJob($validatedRequest, $startPage, $endPage, $cacheKey);
            }
        }

        if (empty($jobs)) return null;

        // Save total batch count in cache to manage completion later
        $totalBatches = 1;
        cache()->put("pending_batches_{$planId}_{$keywordId}", $totalBatches, now()->addHours(2));

        $tiers = $validatedRequest['tiers'] ?? [];

        // Dispatch jobs per source in separate batches
        $dispatched = Bus::batch($jobs)
            ->name("Metadata Search " . strtoupper($source) . " KW-{$keywordId}")
            ->onQueue($source)
            ->then(function (\Illuminate\Bus\Batch $batch) use ($cacheKeys, $planId, $keywordId, $source, $tiers) {
                $this->finalizeBatch($batch, $cacheKeys, $planId, $keywordId, $source, $tiers);
            })
            ->catch(function (\Illuminate\Bus\Batch $batch, \Throwable $e) use ($planId, $keywordId) {
                \Illuminate\Support\Facades\Log::error("Metadata Search Batch failed: " . $e->getMessage());
                cache()->forget("active_search_plan_{$planId}_kw_{$keywordId}");
            })
            ->dispatch();

        return (string) $dispatched->id;
    }

    /**
     * Finalize batch processing by updating cache and cleaning up temporary data.
     *
     * @param \Illuminate\Bus\Batch $batch
     * @param array $cacheKeys
     * @param int $planId
     * @param int $keywordId
     * @param string $source
     * @param array $tiers
     * @return void
     */
    private function finalizeBatch(Batch $batch, array $cacheKeys, int $planId, int $keywordId, string $source, array $tiers = []): void
    {
        cache()->put("batch_done_{$planId}_{$keywordId}_{$source}", true, now()->addHours(2));

        $tempData = ArticleMetadataTemp::where('batch_id', $batch->id)->get();
        
        $missingDoiCount = $tempData->where('status', ArticleTempStatus::MISSING_DOI->value)->count();
        $unmatchedTierCount = $tempData->where('status', ArticleTempStatus::UNMATCHED_TIER->value)->count();
        
        $acceptedData = $tempData->where('status', ArticleTempStatus::ACCEPTED->value);
        $rawArticleIds = $acceptedData->pluck('raw_article_id')->toArray();
        
        $uniqueIds = array_unique($rawArticleIds);
        $duplicateCountInBatch = count($rawArticleIds) - count($uniqueIds);

        $existingIds = FilteredArticle::where('research_plan_id', $planId)
            ->whereIn('raw_article_id', $uniqueIds)
            ->pluck('raw_article_id')
            ->toArray();

        $newIds = array_diff($uniqueIds, $existingIds);
        $finalCount = count($newIds); 

        $insertData = [];
        $now = now();

        foreach ($newIds as $articleId) {
            $insertData[] = [
                'research_plan_id' => $planId,
                'raw_article_id'   => $articleId,
                'created_at'       => $now,
                'updated_at'       => $now,
            ];
        }

        foreach (array_chunk($insertData, 500) as $chunk) {
            FilteredArticle::insert($chunk);
        }

        ResearchPlanKeyword::where('research_plan_id', $planId)
            ->where('keyword_id', $keywordId)
            ->incrementEach([
                'article_count'        => $finalCount,
                'duplicate_count'      => $duplicateCountInBatch,
                'unmatched_tier_count' => $unmatchedTierCount,
                'missing_doi_count'    => $missingDoiCount,
            ]);

        $groupedData = $acceptedData->groupBy('cache_key');

        foreach ($cacheKeys as $key) {
            if (!str_ends_with($key, "src:{$source}")) continue;

            $records = $groupedData->has($key)
                ? array_values(array_unique($groupedData->get($key)->pluck('raw_article_id')->toArray()))
                : [];

            cache()->put($key, $records, now()->addDays(1));
        }

        ArticleMetadataTemp::where('batch_id', $batch->id)->delete();

        $totalBatches   = cache()->get("pending_batches_{$planId}_{$keywordId}", 1);
        $completedCount = cache()->has("batch_done_{$planId}_{$keywordId}_{$source}") ? 1 : 0;

        if ($completedCount >= $totalBatches) {
            cache()->forget("batch_done_{$planId}_{$keywordId}_{$source}");
            cache()->forget("pending_batches_{$planId}_{$keywordId}");
            cache()->forget("active_search_plan_{$planId}_kw_{$keywordId}");
        }
    }
}
