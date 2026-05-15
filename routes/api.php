<?php

use App\Http\Controllers\AIController;
use Illuminate\Support\Facades\Route;

Route::post('/process', [AIController::class, 'process']);