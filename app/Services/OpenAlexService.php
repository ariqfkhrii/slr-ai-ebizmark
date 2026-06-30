<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OpenAlexService
{
    protected string $baseUrl;
    protected ?string $email;

    public function __construct()
    {
        $this->baseUrl = config('services.openalex.base_url', 'https://api.openalex.org');
        $this->email  = config('services.openalex.email');
    }

    /**
     * Fetch the best Open-Access PDF URL for a given DOI from OpenAlex.
     * Returns the OpenAlex work data array, or null if not found / no OA PDF.
     */
    public function fetchWorkByDoi(string $doi): ?array
    {
        $doi = $this->normalizeDoi($doi);

        if (! $doi) {
            return null;
        }

        $url    = "{$this->baseUrl}/works/https://doi.org/{$doi}";
        $params = ['select' => 'id,doi,title,open_access,best_oa_location'];

        if ($this->email) {
            $params['mailto'] = $this->email;
        }

        try {
            $response = Http::timeout(15)->get($url, $params);

            if (! $response->successful()) {
                Log::warning('[OpenAlex] Non-200 response', [
                    'doi'    => $doi,
                    'status' => $response->status(),
                ]);
                return null;
            }

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('[OpenAlex] HTTP error while fetching work', [
                'doi'     => $doi,
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Download and store the PDF for a given DOI.
     * Returns the stored local path (relative to the `public` disk) or null on failure.
     */
    public function downloadPdf(string $doi): ?string
    {
        $work = $this->fetchWorkByDoi($doi);

        if (! $work) {
            return null;
        }

        $pdfUrl = $this->extractPdfUrl($work);

        if (! $pdfUrl) {
            Log::info('[OpenAlex] No OA PDF URL found for DOI', ['doi' => $doi]);
            return null;
        }

        return $this->fetchAndStore($pdfUrl, $doi);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Extract the best OA PDF URL from an OpenAlex work object.
     */
    protected function extractPdfUrl(array $work): ?string
    {
        // Prefer best_oa_location pdf_url
        $pdfUrl = $work['best_oa_location']['pdf_url'] ?? null;

        if ($pdfUrl) {
            return $pdfUrl;
        }

        // Fallback: open_access.oa_url (may be landing page, not direct PDF)
        return $work['open_access']['oa_url'] ?? null;
    }

    /**
     * Verify the URL is reachable and serves a PDF, then stream-save it.
     */
    protected function fetchAndStore(string $pdfUrl, string $doi): ?string
    {
        try {
            // HEAD request to verify content-type before downloading
            $head = Http::timeout(10)->head($pdfUrl);

            $contentType = $head->header('Content-Type') ?? '';

            // Some servers don't respond to HEAD — fall back to GET if HEAD fails
            if (! $head->successful() || ! str_contains($contentType, 'application/pdf')) {
                // Attempt a GET with streaming to check the first bytes
                $getResponse = Http::timeout(30)->withOptions(['stream' => true])->get($pdfUrl);

                if (! $getResponse->successful()) {
                    Log::warning('[OpenAlex] PDF URL not reachable', [
                        'url'    => $pdfUrl,
                        'status' => $getResponse->status(),
                    ]);
                    return null;
                }

                $contentType = $getResponse->header('Content-Type') ?? '';

                if (! str_contains($contentType, 'application/pdf')) {
                    Log::info('[OpenAlex] URL does not serve a PDF', [
                        'url'          => $pdfUrl,
                        'content_type' => $contentType,
                    ]);
                    return null;
                }

                $contents = $getResponse->body();
            } else {
                // Content-Type confirmed via HEAD – do a full GET to download
                $getResponse = Http::timeout(60)->get($pdfUrl);

                if (! $getResponse->successful()) {
                    return null;
                }

                $contents = $getResponse->body();
            }

            $filename = 'pdfs/openalex/' . Str::slug($doi) . '_' . time() . '.pdf';
            Storage::disk('public')->put($filename, $contents);

            Log::info('[OpenAlex] PDF downloaded successfully', [
                'doi'  => $doi,
                'path' => $filename,
            ]);

            return $filename;
        } catch (\Throwable $e) {
            Log::error('[OpenAlex] Error downloading PDF', [
                'url'     => $pdfUrl,
                'doi'     => $doi,
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Normalise a DOI by stripping common prefixes.
     */
    protected function normalizeDoi(string $doi): ?string
    {
        $doi = trim($doi);

        // Strip URL prefixes
        $doi = preg_replace('#^https?://(dx\.)?doi\.org/#i', '', $doi);

        // Strip bare "doi:" prefix
        $doi = preg_replace('/^doi:\s*/i', '', $doi);

        return $doi !== '' ? $doi : null;
    }
}
