<?php

use App\Http\Controllers\AIDivideConquerController;
use Illuminate\Support\Facades\Route;

Route::post('/process-divide-conquer', [AIDivideConquerController::class, 'process']);