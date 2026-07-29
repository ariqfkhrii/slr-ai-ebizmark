<?php

namespace Database\Factories;

use App\Models\Keyword;
use App\Models\ResearchPlan;
use App\Models\ResearchPlanKeyword;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResearchPlanKeyword>
 */
class ResearchPlanKeywordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'research_plan_id' => ResearchPlan::factory(),
            'keyword_id' => Keyword::factory(),

            'article_count' => $this->faker->numberBetween(0, 500),
            'duplicate_count' => $this->faker->numberBetween(0, 100),
            'unmatched_tier_count' => $this->faker->numberBetween(0, 50),
            'missing_doi_count' => $this->faker->numberBetween(0, 50),
            'out_of_year_range_count' => $this->faker->numberBetween(0, 50),
        ];
    }
}
