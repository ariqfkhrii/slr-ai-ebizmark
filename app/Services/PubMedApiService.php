<?php

namespace App\Services;

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
        
        $searchQuery = '("' . $keyword . '"[Title/Abstract] OR "' . $keyword . '"[Other Term] OR "' . $keyword . '"[MeSH Terms])';
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

        if ($response->successful()) {
            $data = $response->json();
            return [
                'total' => (int) ($data['esearchresult']['count'] ?? 0),
                'ids'   => $data['esearchresult']['idlist'] ?? [],
            ];
        }

        Log::warning('PubMed Search Preview API Failed: ' . $response->body());

        return [
            'total' => 0,
            'ids'   => [],
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

        if ($response->successful()) {
            return (string) $response->body();
        }

        Log::warning('PubMed Fetch API Failed: ' . $response->body());

        return '';
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

        if ($response->successful()) {
            return (string) $response->body();
        }

        Log::warning('PubMed Link API Failed: ' . $response->body());

        return '';
    }
}
