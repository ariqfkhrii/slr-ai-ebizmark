<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ResearchPlanController;

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
});

require __DIR__.'/settings.php';