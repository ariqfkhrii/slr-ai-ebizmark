<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class ScopusApiService
{
    /**
     * Enforce the Scopus API rate limit by checking the number of attempts and sleeping if necessary.
     *
     * This method uses Laravel's RateLimiter to track the number of API calls made. If the number of attempts exceeds
     * the defined limit (9 in this case), it will pause execution for a short period (100 milliseconds) before allowing
     * more attempts. This helps to prevent hitting the Scopus API rate limits and ensures smoother operation.
     */
    protected function enforceRateLimit(): void
    {
        $key = 'scopus_api_limiter';

        while (RateLimiter::tooManyAttempts($key, 9)) {
            usleep(100000); 
        }

        RateLimiter::hit($key, 1);
    }

    /**
     * Search the Scopus API for a given keyword and publication year range, returning both the total count and the entries.
     *
     * @param string $keyword The keyword to search for in the Scopus database.
     * @param int $startYear The starting publication year for the search.
     * @param int $endYear The ending publication year for the search.
     * @param int $count The number of results to return in the preview (default is 25).
     * @return array An array containing the total count of results and the entries retrieved from the API.
     * @throws \Exception If the API rate limit is exceeded or if the API call fails.
     */
    public function searchPreviewWithTotal(string $keyword, int $startYear, int $endYear, int $count = 25): array
    {
        $this->enforceRateLimit();

        $query = 'TITLE-ABS-KEY("' . $keyword . '") AND PUBYEAR > ' . ($startYear - 1) . ' AND PUBYEAR < ' . ($endYear + 1);

        $response = Http::withHeaders([
            'X-ELS-APIKey' => config('services.scopus.key'),
            'Accept'       => 'application/json',
        ])->get(config('services.scopus.base_url'), [
            'query' => $query,
            'count' => $count,
            'start' => 0,
        ]);

        if ($response->status() === 429) {
            throw new \Exception('API_RATE_LIMIT');
        }

        if (! $response->successful()) {
            Log::warning('Scopus Search Preview API Failed: ' . $response->body());
            return ['total' => 0, 'entries' => []];
        }

        $data = $response->json();

        return [
            'total'   => (int) ($data['search-results']['opensearch:totalResults'] ?? 0),
            'entries' => $data['search-results']['entry'] ?? []
        ];
    }

    /**
     * Get the total count of search results from the Scopus API for a given keyword and publication year range.
     *
     * @param string $keyword The keyword to search for in the Scopus database.
     * @param int|null $startYear The starting publication year for the search.
     * @param int|null $endYear The ending publication year for the search.
     * @return int The total count of search results matching the criteria.
     * @throws \Exception If the API rate limit is exceeded or if the API call fails.
     */
    public function getTotalCount(string $keyword, ?int $startYear, ?int $endYear): int
    {
        $this->enforceRateLimit();

        $query = 'TITLE-ABS-KEY("' . $keyword . '")';

        if ($startYear !== null && $endYear !== null) {
            $query .= ' AND PUBYEAR > ' . ($startYear - 1) . ' AND PUBYEAR < ' . ($endYear + 1);
        }
        
        $response = Http::withHeaders([
            'X-ELS-APIKey' => config('services.scopus.key'),
            'Accept'       => 'application/json'
        ])->get(config('services.scopus.base_url'), [
            'query' => $query,
            'count' => 1,
        ]);

        if ($response->status() === 429) {
            throw new \Exception('API_RATE_LIMIT');
        }

        if ($response->successful()) {
            $data = $response->json();
            return (int) ($data['search-results']['opensearch:totalResults'] ?? 0);
        }

        Log::error('Scopus Count API Failed: ' . $response->body());
        
        return 0;
    }

    /**
     * Search the Scopus API with the given query, count, and start parameters.
     *
     * @param string $query The search query to be sent to the Scopus API.
     * @param int $count The number of results to return per page.
     * @param int $start The starting index for the search results.
     * @return array An array of search results from the Scopus API.
     * @throws \Exception If the API rate limit is exceeded or if the API call fails.
     */
    public function search(string $query, int $count, int $start): array
    {
        $this->enforceRateLimit();

        $response = Http::withHeaders([
            'X-ELS-APIKey' => config('services.scopus.key'),
            'Accept'       => 'application/json',
        ])->get(config('services.scopus.base_url'), [
            'query' => $query,
            'count' => $count,
            'start' => $start,
        ]);

        if ($response->status() === 429) {
            throw new \Exception('API_RATE_LIMIT');
        }

        if (! $response->successful()) {
            Log::warning('Scopus Search API Failed: ' . $response->body(), [
                'status' => $response->status(),
            ]);

            return [];
        }

        return $response->json('search-results.entry', []);
    }
}
