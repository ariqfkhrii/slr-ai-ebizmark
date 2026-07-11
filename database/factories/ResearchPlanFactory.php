<?php

namespace Database\Factories;

use App\Models\ResearchPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResearchPlan>
 */
class ResearchPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'scopus_quantity' => $this->faker->numberBetween(10, 100),
            'pubmed_quantity' => $this->faker->numberBetween(5, 80),
            'extraction_count' => $this->faker->numberBetween(0, 50),
            'user_id' => User::factory(),
        ];
    }
}
