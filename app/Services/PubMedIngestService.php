<?php

namespace App\Services;

use App\Models\ArticleMetadataTemp;
use App\Models\Keyword;
use App\Models\RawArticle;
use Illuminate\Support\Facades\DB;
use SimpleXMLElement;

class PubMedIngestService
{
    private PubMedApiService $pubmedApi;

    public function __construct(PubMedApiService $pubmedApi)
    {
        $this->pubmedApi = $pubmedApi;
    }

    /**
     * Ingest articles from PubMed based on the provided search parameters and pagination settings.
     * This method retrieves article IDs matching the search criteria, fetches detailed information
     * and citation counts for those articles, and then processes the data in batches to store it
     * in the database. It also handles the association of ingested articles with a preview cache for later retrieval.
     *
     * @param array $validatedRequest The validated request data containing search parameters.
     * @param int $startPage The starting page number for pagination.
     * @param int $endPage The ending page number for pagination.
     * @param string|null $batchId An optional batch ID to associate with the ingested articles.
     * @param string $cacheKey A unique cache key to associate with the ingested articles for preview purposes.
     */
    public function ingest(array $validatedRequest, int $startPage, int $endPage, ?string $batchId, string $cacheKey): void
    {
        $keyword = Keyword::findOrFail($validatedRequest['keyword_id'])->keyword;
        $startYear = (int) $validatedRequest['start_year'];
        $endYear = (int) $validatedRequest['end_year'];

        $itemsPerPage = 25;
        $term = $this->buildTerm($keyword, $startYear, $endYear);

        $retstart = ($startPage - 1) * $itemsPerPage;
        $totalItems = ($endPage - $startPage + 1) * $itemsPerPage;

        $allIds = $this->pubmedApi->searchIds($term, $retstart, $totalItems);

        if (empty($allIds)) {
            return;
        }

        $idChunks = array_chunk($allIds, 250);

        foreach ($idChunks as $chunkedIds) {
            $detailsXml = $this->pubmedApi->fetchDetails($chunkedIds);
            $payloads = $this->parseDetailsXml($detailsXml);

            if (empty($payloads)) {
                continue;
            }

            $citationsXml = $this->pubmedApi->fetchCitations($chunkedIds);
            $citationCounts = $this->parseCitationsXml($citationsXml);

            $this->processBatch($payloads, $citationCounts, $batchId, $cacheKey);
        }
    }

    /**
     * Process a batch of article data by upserting it into the RawArticle table and associating it with the preview cache.
     * This method takes the parsed article payloads and their corresponding citation counts, prepares the data for insertion,
     * and performs a database transaction to ensure data integrity. It also handles the association of ingested articles
     * with a preview cache for later retrieval.
     *
     * @param array $payloads The parsed article data payloads indexed by PubMed ID.
     * @param array $citationCounts The citation counts indexed by PubMed ID.
     * @param string|null $batchId An optional batch ID to associate with the ingested articles.
     * @param string $cacheKey A unique cache key to associate with the ingested articles for preview purposes.
     */
    private function processBatch(array $payloads, array $citationCounts, ?string $batchId, string $cacheKey): void
    {
        $rawArticleBatch = [];
        $previewDois = [];
        $now = now();

        foreach ($payloads as $pmid => $payload) {
            $doi = $payload['doi'];
            $title = $payload['title'];

            if ($doi === null || $title === '') {
                continue;
            }

            $payload['citation_count'] = $citationCounts[$pmid] ?? null;
            $payload['created_at'] = $now;
            $payload['updated_at'] = $now;
            
            $rawArticleBatch[] = $payload;
            $previewDois[] = $doi;
        }

        if (empty($rawArticleBatch)) {
            return;
        }

        DB::transaction(function () use ($rawArticleBatch, $previewDois, $batchId, $cacheKey, $now) {
            RawArticle::upsert(
                $rawArticleBatch,
                ['doi'],
                ['title', 'authors', 'keyword', 'abstract', 'issn_print', 'issn_e', 'tier', 'citation_count', 'publish_year', 'updated_at']
            );

            if (!empty($previewDois)) {
                $uniquePreviewDois = array_unique($previewDois);
                
                $articleIds = RawArticle::whereIn('doi', $uniquePreviewDois)->pluck('id', 'doi');
                $previewBatch = [];

                foreach ($uniquePreviewDois as $doi) {
                    if (isset($articleIds[$doi])) {
                        $previewBatch[] = [
                            'batch_id' => $batchId,
                            'raw_article_id' => $articleIds[$doi],
                            'cache_key' => $cacheKey,
                            'created_at' => $now,
                        ];
                    }
                }

                if (!empty($previewBatch)) {
                    ArticleMetadataTemp::insertOrIgnore($previewBatch);
                }
            }
        });
    }

    /**
     * Build a search term for the PubMed API based on the provided keyword and publication date range.
     * This method constructs a search query that includes the keyword in various fields (Title/Abstract, Other Term, MeSH Terms)
     * and applies filters to ensure that only journal articles indexed in Medline are included, excluding preprints.
     *
     * @param string $keyword The keyword to search for in the articles.
     * @param int $startYear The starting publication year for the search.
     * @param int $endYear The ending publication year for the search.
     * @return string The constructed search term for the PubMed API.
     */
    protected function buildTerm(string $keyword, int $startYear, int $endYear): string
    {
        $searchQuery = '("' . $keyword . '"[Title/Abstract] OR "' . $keyword . '"[Other Term] OR "' . $keyword . '"[MeSH Terms])';
        $qualityFilter = '("Journal Article"[pt] AND "medline"[sb] NOT "preprint"[pt])';

        return $searchQuery . ' AND ' . $qualityFilter . ' AND ' . $startYear . ':' . $endYear . '[dp]';
    }

    /**
     * Parse the XML response from the PubMed API containing detailed article information.
     *
     * @param string $xml The XML response from the PubMed API.
     * @return array The parsed article data payloads indexed by PubMed ID.
     */
    protected function parseDetailsXml(string $xml): array
    {
        if ($xml === '') {
            return [];
        }

        libxml_use_internal_errors(true);
        $root = simplexml_load_string($xml);
        if (! $root) {
            return [];
        }

        $payloads = [];

        foreach ($root->PubmedArticle as $article) {
            $pmid = (string) $article->MedlineCitation->PMID;
            if ($pmid === '') {
                continue;
            }

            $articleNode = $article->MedlineCitation->Article;
            $title = (string) $articleNode->ArticleTitle;
            $abstract    = isset($articleNode->Abstract) ? $this->extractAbstract($articleNode->Abstract) : null;
            $authors     = isset($articleNode->AuthorList) ? $this->extractAuthors($articleNode->AuthorList) : null;
            $keywords    = isset($article->MedlineCitation->KeywordList) ? $this->extractKeywords($article->MedlineCitation->KeywordList) : null;
            $publishYear = isset($articleNode->Journal->JournalIssue->PubDate) ? $this->extractPublishYearFromArticle($articleNode->Journal->JournalIssue->PubDate) : null;
            $issn        = isset($articleNode->Journal->ISSN) ? $this->extractIssn($articleNode->Journal->ISSN) : ['print' => null, 'electronic' => null];
            $doi         = isset($article->PubmedData->ArticleIdList) ? $this->extractDoiFromArticleIdList($article->PubmedData->ArticleIdList) : null;

            $payloads[$pmid] = [
                'doi' => $doi,
                'title' => $title,
                'authors' => $authors,
                'keyword' => $keywords,
                'abstract' => $abstract,
                'issn_print' => $issn['print'],
                'issn_e' => $issn['electronic'],
                'tier' => null,
                'citation_count' => null,
                'publish_year' => $publishYear,
                'source_db' => 'pubmed',
            ];
        }

        return $payloads;
    }

    /**
     * Parse the XML response from the PubMed API containing citation information.
     *
     * @param string $xml The XML response from the PubMed API.
     * @return array The parsed citation counts indexed by PubMed ID.
     */
    protected function parseCitationsXml(string $xml): array
    {
        if ($xml === '') {
            return [];
        }

        libxml_use_internal_errors(true);
        $root = simplexml_load_string($xml);
        if (! $root) {
            return [];
        }

        $counts = [];
        foreach ($root->LinkSet as $linkSet) {
            $pmid = (string) ($linkSet->IdList->Id[0] ?? '');
            if ($pmid === '') {
                continue;
            }

            $count = 0;
            foreach ($linkSet->LinkSetDb as $db) {
                foreach ($db->Link as $link) {
                    $count++;
                }
            }

            $counts[$pmid] = $count;
        }

        return $counts;
    }

    /**
     * Extract and combine the abstract text from the given XML node.
     *
     * @param SimpleXMLElement|null $abstractNode The XML node containing the abstract text.
     * @return string|null The combined abstract text, or null if no valid abstract is found.
     */
    protected function extractAbstract(SimpleXMLElement $abstractNode): ?string
    {
        if (! $abstractNode) {
            return null;
        }

        $parts = [];
        foreach ($abstractNode->AbstractText as $text) {
            $parts[] = trim((string) $text);
        }

        $combined = trim(implode(' ', array_filter($parts)));

        return $combined === '' ? null : $combined;
    }

    /**
     * Extract and combine the author names from the given XML node.
     *
     * @param SimpleXMLElement|null $authorListNode The XML node containing the list of authors.
     * @return string|null The combined author names, or null if no valid authors are found.
     */
    protected function extractAuthors(SimpleXMLElement $authorListNode): ?string
    {
        if (! $authorListNode) {
            return null;
        }

        $names = [];
        foreach ($authorListNode->Author as $authors) {
            if (isset($authors->CollectiveName)) {
                $names[] = (string) $authors->CollectiveName;
                continue;
            }

            $last = (string) ($authors->LastName ?? '');
            $fore = (string) ($authors->ForeName ?? '');
            $full = trim($last . ($fore ? ' ' . $fore : ''));
            if ($full !== '') {
                $names[] = $full;
            }
        }

        return $names === [] ? null : implode(', ', $names);
    }

    /**
     * Extract and combine the keywords from the given XML node.
     *
     * @param SimpleXMLElement|null $keywordListNode The XML node containing the list of keywords.
     * @return string|null The combined keywords, or null if no valid keywords are found.
     */
    protected function extractKeywords(SimpleXMLElement $keywordListNode): ?string
    {
        if (! $keywordListNode) {
            return null;
        }

        $keywords = [];
        foreach ($keywordListNode->Keyword as $keyword) {
            $keywords[] = trim((string) $keyword);
        }

        $keywords = array_filter($keywords);

        return $keywords === [] ? null : implode(', ', $keywords);
    }

    /**
     * Extract the publication year from the given XML node.
     *
     * @param SimpleXMLElement|null $pubDateNode The XML node containing the publication date information.
     * @return int|null The extracted publication year, or null if it cannot be determined.
     */
    protected function extractPublishYearFromArticle(SimpleXMLElement $pubDateNode): ?int
    {
        if (! $pubDateNode) {
            return null;
        }

        $year = (string) ($pubDateNode->Year ?? '');
        if ($year === '') {
            $medlineDate = (string) ($pubDateNode->MedlineDate ?? '');
            $year = substr($medlineDate, 0, 4);
        }

        $parsed = (int) $year;

        return $parsed > 0 ? $parsed : null;
    }

    /**
     * Extract the ISSN values from the given XML node, distinguishing between print and electronic types.
     *
     * @param SimpleXMLElement|null $issnNode The XML node containing the ISSN information.
     * @return array An associative array with 'print' and 'electronic' keys containing the respective ISSN values, or null if not available.
     */
    protected function extractIssn(SimpleXMLElement $issnNode): array
    {
        $result = [
            'print' => null,
            'electronic' => null,
        ];

        if (! $issnNode) {
            return $result;
        }

        $type = strtolower((string) ($issnNode['IssnType'] ?? ''));
        $value = trim((string) $issnNode);

        if ($value === '') {
            return $result;
        }

        if ($type === 'electronic') {
            $result['electronic'] = $value;
        } else {
            $result['print'] = $value;
        }

        return $result;
    }

    /**
     * Extract the DOI from the given XML node containing a list of article IDs.
     *
     * @param SimpleXMLElement|null $articleIdListNode The XML node containing the list of article IDs.
     * @return string|null The extracted DOI, or null if no DOI is found.
     */
    protected function extractDoiFromArticleIdList(SimpleXMLElement $articleIdListNode): ?string
    {
        if (! $articleIdListNode) {
            return null;
        }

        foreach ($articleIdListNode->ArticleId as $articleId) {
            $type = strtolower((string) ($articleId['IdType'] ?? ''));
            if ($type === 'doi') {
                return $this->normalizeDoi((string) $articleId);
            }
        }

        return null;
    }

    /**
     * Normalize a DOI string by trimming whitespace, converting to lowercase, and removing internal spaces.
     *
     * @param string|null $doi The DOI string to normalize.
     * @return string|null The normalized DOI, or null if the input was null or empty after normalization.
     */
    protected function normalizeDoi(?string $doi): ?string
    {
        if (! $doi) {
            return null;
        }

        $doi = strtolower(trim($doi));
        $doi = preg_replace('/\s+/', '', $doi) ?? $doi;

        return $doi === '' ? null : $doi;
    }
}
