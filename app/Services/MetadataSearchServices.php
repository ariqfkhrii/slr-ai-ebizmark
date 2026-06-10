<?php

namespace App\Services;

use App\Models\Keyword;
use App\Models\ResearchPlan;
use App\Models\ScimagoJournal;
use App\Services\PubMedApiService;
use App\Services\ScopusApiService;
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
    public function getPreviewResults($researchPlanId, array $validatedData): array
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
}
