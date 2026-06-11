<?php

namespace App\Services;

use App\Models\ArticleMetadataTemp;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Models\ScimagoJournal;
use Illuminate\Support\Facades\DB;

class ScopusIngestService
{
    public function __construct(private ScopusApiService $scopusApi)
    {
    }

    /**
     * Ingest articles from the Scopus API based on the provided search criteria and pagination parameters.
     *
     * This method retrieves articles from the Scopus API in batches defined by the start and end page parameters. It processes each batch of articles, normalizing DOIs, extracting relevant information, and determining the journal tier based on ISSN values. Valid articles are then upserted into the RawArticle database table, and a subset of articles that meet the preview criteria are stored in the ArticleMetadataTemp table for later retrieval.
     *
     * @param array $validatedRequest The validated request data containing search criteria such as keyword ID, start year, end year, and selected tiers.
     * @param int $startPage The starting page number for pagination (inclusive).
     * @param int $endPage The ending page number for pagination (inclusive).
     * @param string|null $batchId An optional identifier for the batch being processed, used for tracking purposes.
     * @param string $cacheKey A unique key used to associate preview articles with a specific cache entry.
     */
    public function ingest(array $validatedRequest, int $startPage, int $endPage, ?string $batchId, string $cacheKey): void
    {
        $keyword = Keyword::findOrFail($validatedRequest['keyword_id'])->keyword;
        $startYear = (int) $validatedRequest['start_year'];
        $endYear = (int) $validatedRequest['end_year'];

        $itemsPerPage = 25;
        $query = 'TITLE-ABS-KEY("' . $keyword . '") AND PUBYEAR > ' . ($startYear - 1) . ' AND PUBYEAR < ' . ($endYear + 1);

        for ($page = $startPage; $page <= $endPage; $page++) {
            $startIndex = ($page - 1) * $itemsPerPage;
            $entries = $this->scopusApi->search($query, $itemsPerPage, $startIndex);

            if (empty($entries)) {
                continue;
            }

            $this->processBatch($entries, $validatedRequest, $batchId, $cacheKey);
        }
    }

    /**
     * Process a batch of article entries retrieved from the Scopus API, normalizing data, determining journal tiers, and storing valid articles in the database.
     *
     * This method takes a batch of article entries and performs several processing steps. It normalizes DOIs, extracts relevant information such as title, authors, keywords, and publication year, and determines the journal tier based on ISSN values using a pre-fetched dictionary. Valid articles are then upserted into the RawArticle database table, and a subset of articles that meet the preview criteria are stored in the ArticleMetadataTemp table for later retrieval.
     *
     * @param array $entries The batch of article entries retrieved from the Scopus API to be processed.
     * @param array $validatedRequest The validated request data containing search criteria such as selected tiers for filtering articles.
     * @param string|null $batchId An optional identifier for the batch being processed, used for tracking purposes when storing preview articles.
     * @param string $cacheKey A unique key used to associate preview articles with a specific cache entry in the ArticleMetadataTemp.
     */
    private function processBatch(array $entries, array $validatedRequest, ?string $batchId, string $cacheKey): void
    {
        $validEntries = [];
        $issns = [];

        foreach ($entries as $entry) {
            $doi = $this->normalizeDoi($entry['prism:doi'] ?? null);
            $title = $entry['dc:title'] ?? '';

            if ($title === '' || $doi === null) {
                continue;
            }

            $issnPrint = $entry['prism:issn'] ?? null;
            $issnE = $entry['prism:eIssn'] ?? null;

            if ($issnPrint) $issns[] = $issnPrint;
            if ($issnE) $issns[] = $issnE;

            $entry['_doi'] = $doi;
            $validEntries[] = $entry;
        }

        if (empty($validEntries)) {
            return;
        }

        $tiersDictionary = $this->fetchTiersDictionary(array_unique($issns));
        
        $rawArticleBatch = [];
        $previewDois = [];
        $now = now();
        
        $requestedTiers = array_map('strtolower', $validatedRequest['tiers'] ?? []);
        
        foreach ($validEntries as $entry) {
            $doi = $entry['_doi'];
            $title = $entry['dc:title'];
            $issnPrint = $entry['prism:issn'] ?? null;
            $issnE = $entry['prism:eIssn'] ?? null;
            $tier = $this->resolveTierFromDictionary($issnPrint, $issnE, $tiersDictionary);

            if (!empty($requestedTiers)) {
                if ($tier === null || !in_array(strtolower($tier), $requestedTiers)) {
                    continue;
                }
            }

            $rawArticleBatch[] = [
                'doi' => $doi,
                'title' => $title,
                'authors' => $this->extractAuthors($entry),
                'keyword' => $this->extractArticleKeywords($entry),
                'abstract' => $entry['dc:description'] ?? null,
                'issn_print' => $issnPrint,
                'issn_e' => $issnE,
                'tier' => $tier,
                'citation_count' => isset($entry['citedby-count']) ? (int) $entry['citedby-count'] : null,
                'publish_year' => $this->extractPublishYear($entry['prism:coverDate'] ?? null),
                'source_db' => 'scopus',
                'created_at' => $now,
                'updated_at' => $now,
            ];

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
        });
    }

    /**
     * Fetch a dictionary mapping ISSN values to their corresponding journal tiers from the ScimagoJournal model.
     *
     * This method retrieves journal records from the ScimagoJournal model based on the provided ISSN values. It constructs a dictionary that maps both print and electronic ISSN values to their respective journal tiers (best quartile). This allows for efficient lookup of journal tiers during article processing, enabling the service to determine which articles meet the specified tier criteria for preview storage.
     *
     * @param array $issns An array of ISSN values (both print and electronic) to look up in the ScimagoJournal model.
     * @return array A dictionary mapping ISSN values to their corresponding journal tiers, used for quick tier resolution during article processing.
     */
    private function fetchTiersDictionary(array $issns): array
    {
        if (empty($issns)) {
            return [];
        }

        $journals = ScimagoJournal::whereIn('issn_print', $issns)
            ->orWhereIn('issn_e', $issns)
            ->get(['issn_print', 'issn_e', 'best_quartile']);

        $dictionary = [];

        // Build a dictionary mapping ISSN values to their corresponding journal tiers for quick lookup during article processing
        foreach ($journals as $journal) {
            if ($journal->issn_print) {
                $dictionary[$journal->issn_print] = strtolower($journal->best_quartile);
            }
            if ($journal->issn_e) {
                $dictionary[$journal->issn_e] = strtolower($journal->best_quartile);
            }
        }

        return $dictionary;
    }

    /**
     * Resolve the journal tier for an article based on its ISSN values using the provided dictionary.
     *
     * This method takes the print and electronic ISSN values of an article and looks them up in the provided dictionary to determine the journal tier. It first checks the print ISSN, and if a match is found, it returns the corresponding tier. If no match is found for the print ISSN, it then checks the electronic ISSN. If neither ISSN matches an entry in the dictionary, it returns null, indicating that the tier could not be determined for the article.
     *
     * @param string|null $issnPrint The print ISSN value of the article, used for tier resolution.
     * @param string|null $issnE The electronic ISSN value of the article, used for tier resolution if the print ISSN does not yield a result.
     * @param array $dictionary A dictionary mapping ISSN values to their corresponding journal tiers, used for lookup during tier resolution.
     * @return string|null The resolved journal tier for the article based on its ISSN values, or null if no tier could be determined.
     */
    private function resolveTierFromDictionary(?string $issnPrint, ?string $issnE, array $dictionary): ?string
    {
        if ($issnPrint && isset($dictionary[$issnPrint])) {
            return $dictionary[$issnPrint];
        }

        if ($issnE && isset($dictionary[$issnE])) {
            return $dictionary[$issnE];
        }

        return null;
    }

    /**
     * Normalize a DOI string by trimming whitespace, converting to lowercase, and removing internal spaces.
     *
     * This method takes a DOI string as input and performs several normalization steps to ensure consistency. It trims leading and trailing whitespace, converts the string to lowercase, and removes any internal spaces. If the resulting string is empty after normalization, it returns null. This helps to standardize DOI values for accurate matching and storage in the database.
     *
     * @param string|null $doi The DOI string to be normalized, which may contain extra whitespace or uppercase characters.
     * @return string|null The normalized DOI string, or null if the input is empty or results in an empty string after normalization.
     */
    protected function normalizeDoi(?string $doi): ?string
    {
        if (! $doi) return null;
        $doi = strtolower(trim($doi));
        $doi = preg_replace('/\s+/', '', $doi) ?? $doi;
        return $doi === '' ? null : $doi;
    }

    /**
     * Extract and combine author names from the given article entry, prioritizing the 'authors' field and falling back to 'dc:creator' if necessary.
     *
     * This method checks for the presence of an 'authors' field in the article entry, which is expected to be an array of author objects. It extracts the 'authname' from each author object and combines them into a single string separated by commas. If the 'authors' field is not present or does not contain valid data, it falls back to checking for a 'dc:creator' field, which may contain a single author name. If neither field provides valid author information, it returns null.
     *
     * @param array $entry The article entry from which to extract author information, containing potential 'authors' and 'dc:creator' fields.
     * @return string|null A combined string of author names extracted from the entry, or null if no valid author information is found.
     */
    protected function extractAuthors(array $entry): ?string
    {
        if (isset($entry['authors']) && is_array($entry['authors'])) {
            $names = [];
            // Extract author names from the 'authors' field, combining them into a single string separated by commas
            foreach ($entry['authors'] as $authors) {
                if (isset($authors['authname'])) $names[] = $authors['authname'];
            }
            if ($names !== []) return implode(', ', $names);
        }
        return isset($entry['dc:creator']) ? (string) $entry['dc:creator'] : null;
    }

    /**
     * Extract and combine keywords from the given article entry, prioritizing the 'authkeywords' field.
     *
     * This method checks for the presence of an 'authkeywords' field in the article entry, which is expected to contain a string of keywords separated by ' | '. It replaces the ' | ' separator with a comma and space, and trims the resulting string. If the 'authkeywords' field is not present or results in an empty string after processing, it returns null.
     *
     * @param array $entry The article entry from which to extract keyword information, containing a potential 'authkeywords' field.
     * @return string|null A combined string of keywords extracted from the entry, or null if no valid keyword information is found.
     */
    protected function extractArticleKeywords(array $entry): ?string
    {
        if (isset($entry['authkeywords'])) {
            $keywords = str_replace(' | ', ', ', (string) $entry['authkeywords']);
            return trim($keywords) !== '' ? trim($keywords) : null;
        }
        return null;
    }

    /**
     * Extract the publication year from the given cover date string in the format 'YYYY-MM-DD' or 'YYYY'.
     *
     * This method takes a cover date string as input and attempts to extract the publication year. It checks if the input is valid and then uses substring operations to retrieve the first four characters, which represent the year. If the extracted year is a positive integer, it returns the year; otherwise, it returns null.
     *
     * @param string|null $coverDate The cover date string from which to extract the publication year, expected in formats like 'YYYY-MM-DD' or 'YYYY'.
     * @return int|null The extracted publication year as an integer, or null if the input is invalid or does not contain a valid year.
     */
    protected function extractPublishYear(?string $coverDate): ?int
    {
        if (! $coverDate) return null;
        $year = (int) substr($coverDate, 0, 4);
        return $year > 0 ? $year : null;
    }
}
