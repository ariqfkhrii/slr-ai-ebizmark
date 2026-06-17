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

        $storedPath = $validated['pdf']->store('uploads/doi-checks', 'public');

        Log::info('DOI upload stored file', [
            'stored_path' => $storedPath,
        ]);

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

        $planId = $validated['research_plan_id'];
        $keywordId = $validated['keyword_id'] ?? null;
        $size = $validated['size'] ?? 10;

        $paginator = $this->filteredArticleService->getPaginatedArticles($planId, $keywordId, $size);

        $formattedData = $paginator->through(function ($filteredArticle) {
            return [
                'doi'                 => $filteredArticle->rawArticle->doi ?? '-',
                'title'               => $filteredArticle->rawArticle->title ?? 'Tidak Ada Judul',
                'publish_year'        => $filteredArticle->rawArticle->publish_year ?? '-',
                'tier'                => $filteredArticle->rawArticle->tier ?? '-',
            ];
        });

        return response()->json($formattedData);
    }
}