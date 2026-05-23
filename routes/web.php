<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\FilteredArticleController;
use App\Http\Controllers\ResearchPlanController;
use App\Http\Controllers\ResearchPlanKeywordController;

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

    Route::post('/filtered-articles/check-doi', [FilteredArticleController::class, 'store'])
        ->name('filtered-articles.check-doi');
        
    Route::get('prisma', [ResearchPlanController::class, 'prisma'])
        ->name('prisma');

    // Research Plan Keywords
    Route::get('/research-plans/{researchPlanId}/keywords', [ResearchPlanKeywordController::class, 'index']);
    Route::post('/research-plans/{researchPlanId}/keywords', [ResearchPlanKeywordController::class, 'store']);
    Route::put('/research-plans/{researchPlanId}/keywords', [ResearchPlanKeywordController::class, 'update']);
    Route::delete('/research-plans/{researchPlanId}/keywords/{keywordId}', [ResearchPlanKeywordController::class, 'destroy']);
});

require __DIR__.'/settings.php';