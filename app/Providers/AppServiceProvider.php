<?php

namespace App\Providers;

use App\Models\AutoReporting;
use App\Services\FilteredArticleService;
use App\Services\MetadataSearchServices;
use App\Services\PubMedApiService;
use App\Services\ResearchPlanKeyword\ResearchPlanKeywordService;
use App\Services\ScopusApiService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Http\Interfaces\ResearchPlanRepositoryInterface::class,
            \App\Repositories\ResearchPlanRepository::class
        );

        $this->app->bind(
            \App\Http\Interfaces\ResearchPlanServiceInterface::class,
            \App\Services\ResearchPlanService::class
        );
        $this->app->bind(ResearchPlanKeywordService::class, function ($app) {
            return new ResearchPlanKeywordService();
        });

        $this->app->bind(PubMedApiService::class);
        $this->app->bind(ScopusApiService::class);
        $this->app->bind(MetadataSearchServices::class);
        $this->app->bind(FilteredArticleService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Route model binding
        Route::model('autoReporting', AutoReporting::class);
        
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
