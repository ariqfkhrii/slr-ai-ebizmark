<?php

use App\Http\Controllers\AiClassificationController;
use App\Http\Controllers\AiExtractionController;
use App\Http\Controllers\AutoReportingController;
use App\Http\Controllers\ClassificationController;
use App\Http\Controllers\ExtractionController;
use App\Http\Controllers\FilteredArticleController;
use App\Http\Controllers\MetadataSearchController;
use App\Http\Controllers\PurificationController;
use App\Http\Controllers\ResearchPlanController;
use App\Http\Controllers\ResearchPlanKeywordController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [ResearchPlanController::class, 'index'])
        ->name('dashboard');

    Route::post('/research-plans', [ResearchPlanController::class, 'store'])
        ->name('research-plans.store');

    Route::put('/research-plans/{researchPlan}', [ResearchPlanController::class, 'update'])
        ->name('research-plans.update');

    Route::delete('/research-plans/{researchPlan}', [ResearchPlanController::class, 'destroy'])
        ->name('research-plans.destroy');

    Route::post('/research-plans/{id}/metadata/preview', [MetadataSearchController::class, 'getPreview'])
        ->name('metadata.preview');

    Route::post('/research-plans/{id}/metadata/execute', [MetadataSearchController::class, 'dispatchResult'])
        ->name('metadata.execute');

    Route::get('/metadata/batches/{batchId}/progress', [MetadataSearchController::class, 'batchProgress'])
        ->name('metadata.batch-progress');
        
    Route::post('/search/cancel/{batchId}', [MetadataSearchController::class, 'cancelSearch'])
        ->name('search.cancel');

    Route::get('/filtered-articles', [FilteredArticleController::class, 'index'])
        ->name('filtered-articles.index');

    Route::get('/research-plans/{planId}/purification', [PurificationController::class, 'index'])
        ->name('purification.index');
    
    Route::put('/purification/update-status', [PurificationController::class, 'update'])
        ->name('purification.update');
        
    Route::post('/filtered-articles/check-doi', [FilteredArticleController::class, 'store'])
        ->name('filtered-articles.check-doi');

    Route::put('/filtered-articles/{filteredArticle}/retrieval', [FilteredArticleController::class, 'updateRetrieval'])
        ->name('filtered-articles.update-retrieval');

    Route::put('/classification-setup', [ClassificationController::class, 'upsertSetup'])
        ->name('classification-setup.upsert');

    Route::put('/classification/{filteredArticle}', [ClassificationController::class, 'updateArticleClassification'])
        ->name('classification.update');

    Route::post('/ai-classification/run', [AiClassificationController::class, 'run'])
        ->name('ai-classification.run');

    Route::post('/ai-extraction/run', [AiExtractionController::class, 'run'])
        ->name('ai-extraction.run');

    Route::put('/extraction/{filteredArticle}', [ExtractionController::class, 'update'])
        ->name('extraction.update');
        
    Route::get('prisma', [ResearchPlanController::class, 'prisma'])
        ->name('prisma');

    Route::get('/research-plans/{researchPlanId}/auto-reporting', [AutoReportingController::class, 'index'])
        ->name('auto-reporting.index');
    Route::post('/auto-reportings/{autoReporting}/generate', [AutoReportingController::class, 'generate'])
        ->name('auto-reporting.generate');
    Route::put('/auto-reportings/{autoReporting}', [AutoReportingController::class, 'update'])
        ->name('auto-reporting.update');
    Route::post('/auto-reportings/{autoReporting}/regenerate', [AutoReportingController::class, 'regenerate'])
        ->name('auto-reporting.regenerate');

    // Research Plan Keywords
    Route::get('/research-plans/{researchPlanId}/keywords', [ResearchPlanKeywordController::class, 'index']);
    Route::post('/research-plans/{researchPlanId}/keywords', [ResearchPlanKeywordController::class, 'store']);
    Route::put('/research-plans/{researchPlanId}/keywords', [ResearchPlanKeywordController::class, 'update']);
    Route::delete('/research-plans/{researchPlanId}/keywords/{keywordId}', [ResearchPlanKeywordController::class, 'destroy']);
});

require __DIR__.'/settings.php';