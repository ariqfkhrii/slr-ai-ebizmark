<?php

namespace App\Providers;

use App\Services\ResearchPlanKeyword\ResearchPlanKeywordService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
