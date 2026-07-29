<?php

namespace Database\Factories;

use App\Models\FilteredArticle;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FilteredArticle>
 */
class FilteredArticleFactory extends Factory
{
    protected $model = FilteredArticle::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'research_plan_id' => ResearchPlan::factory(),
            'raw_article_id' => RawArticle::factory(),
            'keyword_id' => Keyword::factory(),
            'similarity_score' => $this->faker->optional()->randomFloat(2, 0, 1),
            'included' => $this->faker->boolean(80),
            'retrieved' => $this->faker->boolean(70),
            'novelty_status' => $this->faker->boolean(30),
            'ai_usage_status' => $this->faker->boolean(20),
            'article_status' => $this->faker->randomElement(['new', 'reviewed', 'excluded', 'included', null]),
            'pdf_path' => $this->faker->optional()->filePath(),
        ];
    }
}
