<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetFilteredArticlesRequest;
use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use App\Services\FilteredArticleDoiService;
use App\Services\FilteredArticleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FilteredArticleController extends Controller
{
    public function __construct(
        protected FilteredArticleDoiService $service,
        protected FilteredArticleService $filteredArticleService,
    ) {
    }

    public function store(Request $request)
    {
        Log::info('DOI upload attempt', [
            'user_id' => $request->user()?->id,
            'research_plan_id' => $request->input('research_plan_id'),
            'has_pdf' => $request->hasFile('pdf'),
            'pdf_name' => $request->file('pdf')?->getClientOriginalName(),
            'pdf_mime' => $request->file('pdf')?->getMimeType(),
            'pdf_size' => $request->file('pdf')?->getSize(),
        ]);

        try {
            $validated = $request->validate([
                'pdf' => ['required', 'file', 'mimetypes:application/pdf', 'max:10240'],
                'research_plan_id' => [
                    'required',
                    'integer',
                    Rule::exists('research_plans', 'research_plan_id'),
                ],
                'filtered_article_id' => ['nullable', 'integer', Rule::exists('filtered_articles', 'id')],
            ]);
        } catch (ValidationException $exception) {
            Log::warning('DOI upload validation failed', [
                'user_id' => $request->user()?->id,
                'errors' => $exception->errors(),
            ]);

            throw $exception;
        }

        $researchPlan = ResearchPlan::query()
            ->where('research_plan_id', $validated['research_plan_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $researchPlan) {
            Log::warning('DOI upload blocked: research plan not found or not owned by user', [
                'user_id' => $request->user()?->id,
                'research_plan_id' => $validated['research_plan_id'],
            ]);
            abort(403);
        }

        Log::info('DOI upload passed validation and ownership check', [
            'user_id' => $request->user()?->id,
            'research_plan_id' => $validated['research_plan_id'],
        ]);

        $storedPath = $validated['pdf']->store('uploads/manual-pdfs', 'public');

        Log::info('DOI upload stored file', [
            'stored_path' => $storedPath,
        ]);

        if (! empty($validated['filtered_article_id'])) {
            $filteredArticle = FilteredArticle::query()
                ->where('id', $validated['filtered_article_id'])
                ->where('research_plan_id', $validated['research_plan_id'])
                ->firstOrFail();

            $filteredArticle->update([
                'retrieved' => true,
                'pdf_path' => $storedPath,
            ]);

            Log::info('Manual PDF upload assigned to filtered article', [
                'filtered_article_id' => $filteredArticle->id,
                'research_plan_id' => $filteredArticle->research_plan_id,
                'pdf_path' => $storedPath,
            ]);

            return redirect()->back()->with([
                'success' => 'PDF berhasil diunggah untuk artikel ini.',
            ]);
        }

        $result = $this->service->extractAndMatch(
            $validated['pdf'],
            (int) $validated['research_plan_id'],
            $storedPath,
        );

        Log::info('DOI upload processed', [
            'doi_found_count' => $result['doi_found_count'],
            'matched_count' => $result['matched_count'],
            'created_count' => $result['created_count'],
        ]);

        return redirect()->back()->with([
            'success' => sprintf(
            'Upload diproses: %d DOI ditemukan, %d match, %d data baru filtered article.',
            $result['doi_found_count'],
            $result['matched_count'],
            $result['created_count'],
            ),
            'doi_debug' => [
                'stored_path' => $storedPath,
                'dois' => $result['dois'],
                'matched_article_ids' => $result['matched_article_ids'],
            ],
        ]);
    }

    public function updateRetrieval(Request $request, FilteredArticle $filteredArticle)
    {
        $validated = $request->validate([
            'retrieved' => ['required', 'boolean'],
        ]);

        $filteredArticle->loadMissing('researchPlan');

        if ($filteredArticle->researchPlan?->user_id !== $request->user()->id) {
            Log::warning('Unauthorized retrieval update attempt', [
                'user_id' => $request->user()?->id,
                'filtered_article_id' => $filteredArticle->id,
                'owner_id' => $filteredArticle->researchPlan?->user_id,
            ]);

            abort(403);
        }

        $filteredArticle->update([
            'retrieved' => $validated['retrieved'],
        ]);

        return redirect()->back()->with('success', 'Status retrieval berhasil diupdate.');
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index(GetFilteredArticlesRequest $request)
    {
        $validated = $request->validated();

        $paginator = $this->filteredArticleService->getPaginatedArticles(
            planId: $validated['research_plan_id'],
            keywordId: $validated['keyword_id'] ?? null,
            size: $validated['size'] ?? 10,
            search: $validated['search'] ?? null,
            included: isset($validated['included']) ? filter_var($validated['included'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null,
            yearFrom: $validated['year_from'] ?? null,
            yearTo: $validated['year_to'] ?? null,
            tiers: $validated['tiers'] ?? null,
        );

        return response()->json(
            $paginator->through(fn ($fa) => [
                'id' => $fa->id,
                'doi' => $fa->rawArticle->doi ?? '-',
                'title' => $fa->rawArticle->title ?? '-',
                'publish_year' => $fa->rawArticle->publish_year ?? '-',
                'tier' => $fa->rawArticle->tier ?? '-',
                'included' => $fa->included,
            ])
        );
    }

    /**
     * Manually trigger OpenAlex PDF fetch for a single filtered article.
     * POST /filtered-articles/{filteredArticle}/auto-fetch
     */
    public function autoFetch(Request $request, FilteredArticle $filteredArticle)
    {
        $filteredArticle->loadMissing('researchPlan');

        if ($filteredArticle->researchPlan?->user_id !== $request->user()->id) {
            Log::warning('Unauthorized autoFetch attempt', [
                'user_id' => $request->user()?->id,
                'filtered_article_id' => $filteredArticle->id,
                'owner_id' => $filteredArticle->researchPlan?->user_id,
            ]);

            abort(403);
        }

        $dispatched = $this->filteredArticleService->triggerOpenAlexFetch($filteredArticle->id);

        if (! $dispatched) {
            return redirect()->back()->with(
                'warning',
                'Fetch OpenAlex dilewati karena artikel belum included atau sudah retrieved.'
            );
        }

        return redirect()->back()->with(
            'success',
            'Proses pencarian PDF publik (OpenAlex) telah dijadwalkan untuk artikel ini.'
        );
    }

    /**
     * Return minimal status for a filtered article (used by client polling).
     * GET /filtered-articles/{filteredArticle}/status
     */
    public function status(Request $request, FilteredArticle $filteredArticle)
    {
        $filteredArticle->loadMissing('researchPlan');

        if ($filteredArticle->researchPlan?->user_id !== $request->user()->id) {
            Log::warning('Unauthorized status access attempt', [
                'user_id' => $request->user()?->id,
                'filtered_article_id' => $filteredArticle->id,
                'owner_id' => $filteredArticle->researchPlan?->user_id,
            ]);

            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json([
            'id' => $filteredArticle->id,
            'retrieved' => (bool) $filteredArticle->retrieved,
            'pdf_path' => $filteredArticle->pdf_path,
        ]);
    }

    /**
     * Manually trigger OpenAlex PDF fetch for all un-retrieved articles in a plan.
     * POST /research-plans/{researchPlanId}/auto-fetch-all
     */
    public function autoFetchAll(Request $request, int $researchPlanId)
    {
        $researchPlan = ResearchPlan::where('research_plan_id', $researchPlanId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $dispatched = $this->filteredArticleService->triggerAllOpenAlexFetch($researchPlan->research_plan_id);

        return redirect()->back()->with(
            'success',
            "Proses pencarian PDF publik (OpenAlex) telah dijadwalkan untuk {$dispatched} artikel."
        );
    }
}