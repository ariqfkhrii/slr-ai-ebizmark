<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class PubMedApiService
{
    /**
     * Build the full API endpoint URL based on the configured base URL and the specific endpoint.
     * This method ensures that if the base URL already includes an endpoint, it will be replaced
     * with the new one, allowing for flexible configuration.
     *
     * @param string $endpoint The specific API endpoint to call (e.g., 'esearch.fcgi', 'esummary.fcgi').
     * @return string The full URL to the API endpoint.
     */
    protected function buildEndpoint(string $endpoint): string
    {
        $baseUrl = (string) config('services.pubmed.base_url');

        if (str_ends_with($baseUrl, '/esearch.fcgi')) {
            return substr($baseUrl, 0, -strlen('/esearch.fcgi')) . '/' . $endpoint;
        }

        return rtrim($baseUrl, '/') . '/' . $endpoint;
    }

    /**
     * Enforce a dynamic rate limit to comply with PubMed's API usage guidelines.
     * Limits to 10 requests per second if an API key is provided, otherwise 3 requests per second.
     * This method uses Laravel's RateLimiter to track the number of attempts and introduces a delay
     * when the limit is exceeded, ensuring that the application does not overwhelm the API.
     */
    protected function enforceRateLimit(): void
    {
        $key = 'pubmed_api_limiter';
        
        $hasApiKey = !empty(config('services.pubmed.key'));
        
        $maxAttempts = $hasApiKey ? 10 : 3;

        while (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            usleep(100000); 
        }

        RateLimiter::hit($key, 1);
    }
    
    /**
     * Build a PubMed API query string for a given keyword.
     *
     * @param string $keyword The keyword to search for.
     * @return string The formatted PubMed API query.
     */
    public function buildPubMedQuery(string $keyword): string
    {
        $keyword = preg_replace('/\s+/', ' ', trim($keyword));

        $tokens = preg_split('/\b(AND|OR|NOT)\b/', $keyword, -1, PREG_SPLIT_DELIM_CAPTURE);
        
        $queryBuilder = [];

        foreach ($tokens as $token) {
            $token = trim($token);

            if (empty($token)) {
                continue;
            }

            if (in_array($token, ['AND', 'OR', 'NOT'])) {
                $queryBuilder[] = $token;
            } else {
                if (str_contains($token, ' ') && !str_starts_with($token, '"') && !str_ends_with($token, '"')) {
                    $token = '"' . $token . '"';
                }
                
                $queryBuilder[] = $token;
            }
        }

        $formattedKeyword = implode(' ', $queryBuilder);
        $finalQuery = '(' . $formattedKeyword . ')';

        return $finalQuery;
    }

    /**
     * Search PubMed for a keyword and year range, returning both the total count and the IDs.
     * This combines the count request and the ID retrieval into a single API call for efficiency.
     *
     * @param string $keyword The keyword to search for.
     * @param int $startYear The starting publication year.
     * @param int $endYear The ending publication year.
     * @param int $count The number of IDs to return in the preview (default is 25).
     * @return array An array containing 'total' and 'ids'.
     */
    public function searchIdsPreviewWithTotal(string $keyword, int $startYear, int $endYear, int $count = 25): array
    {
        $this->enforceRateLimit();
        
        $searchQuery = $this->buildPubMedQuery($keyword);
        $qualityFilter = '("Journal Article"[pt] AND "medline"[sb] NOT "preprint"[pt])';
        $term = $searchQuery . ' AND ' . $qualityFilter . ' AND ' . $startYear . ':' . $endYear . '[dp]';

        $response = Http::get($this->buildEndpoint('esearch.fcgi'), [
            'db'       => 'pubmed',
            'term'     => $term,
            'retmode'  => 'json',
            'retstart' => 0,
            'retmax'   => $count,
            'api_key'  => config('services.pubmed.key'),
        ]);

        $this->handleApiResponseErrors($response);

        $data = $response->json();
        
        return [
            'total' => (int) ($data['esearchresult']['count'] ?? 0),
            'ids'   => $data['esearchresult']['idlist'] ?? [],
        ];
    }
    
    /**
     * Fetch detailed information for a list of article IDs in XML format.
     *
     * @param array $ids The list of article IDs.
     * @return string The XML response containing detailed information about the articles.
     */
    public function fetchDetails(array $ids): string
    {
        if ($ids === []) {
            return '';
        }

        $this->enforceRateLimit();

        $response = Http::asForm()->post($this->buildEndpoint('efetch.fcgi'), [
            'db'      => 'pubmed',
            'retmode' => 'xml',
            'id'      => implode(',', $ids),
            'api_key' => config('services.pubmed.key'),
        ]);

        $this->handleApiResponseErrors($response);

        return (string) $response->body();
    }

    /**
     * Fetch citation information for a list of article IDs.
     *
     * @param array $ids The list of article IDs.
     * @return string The XML response containing citation information about the articles.
     */
    public function fetchCitations(array $ids): string
    {
        if ($ids === []) {
            return '';
        }

        $this->enforceRateLimit();

        $response = Http::asForm()->post($this->buildEndpoint('elink.fcgi'), [
            'dbfrom'   => 'pubmed',
            'linkname' => 'pubmed_pubmed_citedin',
            'retmode'  => 'xml',
            'id'       => implode(',', $ids),
            'api_key'  => config('services.pubmed.key'),
        ]);

        $this->handleApiResponseErrors($response);

        return (string) $response->body();
    }
    
    /**
     * Get the total count of articles matching the specified keyword and publication date range.
     *
     * @param string $keyword The keyword to search for in the articles.
     * @param int|null $startYear The starting publication year for the search.
     * @param int|null $endYear The ending publication year for the search.
     * @return int The total count of matching articles.
     */
    public function getTotalCount(string $keyword, ?int $startYear, ?int $endYear): int
    {
        $this->enforceRateLimit();

        $searchQuery = $this->buildPubMedQuery($keyword);
        $qualityFilter = '("Journal Article"[pt] AND "medline"[sb] NOT "preprint"[pt])';
        
        $term = $searchQuery . ' AND ' . $qualityFilter;

        if ($startYear !== null && $endYear !== null) {
            $term .= ' AND ' . $startYear . ':' . $endYear . '[dp]';
        }

        $response = Http::get($this->buildEndpoint('esearch.fcgi'), [
            'db'      => 'pubmed',
            'term'    => $term,
            'retmode' => 'json',
            'retmax'  => 1,
            'api_key' => config('services.pubmed.key'),
        ]);

        $this->handleApiResponseErrors($response);

        $data = $response->json();
        
        return (int) ($data['esearchresult']['count'] ?? 0);
    }

    /**
     * Search for article IDs based on a search term and pagination parameters.
     *
     * @param string $term The search term.
     * @param int $retstart The starting index for the results.
     * @param int $retmax The maximum number of results to return.
     * @return array The list of matching article IDs.
     */
    public function searchIds(string $term, int $retstart, int $retmax): array
    {
        $this->enforceRateLimit();

        $response = Http::get($this->buildEndpoint('esearch.fcgi'), [
            'db'       => 'pubmed',
            'term'     => $term,
            'retmode'  => 'json',
            'retstart' => $retstart,
            'retmax'   => $retmax,
            'api_key'  => config('services.pubmed.key'),
        ]);

        $this->handleApiResponseErrors($response);

        return $response->json('esearchresult.idlist', []);
    }

    /**
     * Fetch summaries for a list of article IDs.
     *
     * @param array $ids The list of article IDs.
     * @return array The list of article summaries.
     */
    public function fetchSummaries(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $this->enforceRateLimit();

        $response = Http::get($this->buildEndpoint('esummary.fcgi'), [
            'db'      => 'pubmed',
            'retmode' => 'json',
            'id'      => implode(',', $ids),
            'api_key' => config('services.pubmed.key'),
        ]);

        $this->handleApiResponseErrors($response);

        return $response->json('result', []);
    }

    /**
     * Handle API response errors and throw appropriate exceptions for PubMed.
     *
     * @param Response $response
     * @throws \Exception
     */
    protected function handleApiResponseErrors(Response $response): void
    {
        $status = $response->status();
        $body = $response->body();

        if (!$response->successful()) {
            Log::error('PubMed API HTTP Error: ' . $body, ['status' => $status]);

            match ($status) {
                400 => throw new \Exception('BAD_REQUEST'),
                401, 403 => throw new \Exception('AUTH_ERROR'),
                429 => throw new \Exception('API_RATE_LIMIT'),
                500, 502, 503, 504 => throw new \Exception('SERVER_ERROR'),
                default => throw new \Exception('UNKNOWN_API_ERROR'),
            };
        }

        $contentType = $response->header('Content-Type') ?? '';

        if (str_contains($contentType, 'json')) {
            $data = $response->json();
            
            if (isset($data['error'])) {
                Log::error('PubMed API Logic Error (JSON): ' . $body);
                throw new \Exception('BAD_REQUEST');
            }
        } else {
            if (str_contains($body, '<ERROR>') || str_contains($body, '<ErrorList>')) {
                Log::error('PubMed API Logic Error (XML): ' . $body);
                throw new \Exception('BAD_REQUEST');
            }
        }
    }
}
