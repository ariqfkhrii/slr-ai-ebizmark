<?php

namespace Database\Factories;

use App\Models\RawArticle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RawArticle>
 */
class RawArticleFactory extends Factory
{
    protected $model = RawArticle::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'doi' => $this->faker->boolean(70) ? $this->faker->unique()->isbn13() : null,
            'title' => $this->faker->sentence(8),
            'authors' => $this->faker->name() . ', ' . $this->faker->name(),
            'keyword' => $this->faker->word(),
            'abstract' => $this->faker->paragraph(),
            'issn_print' => $this->faker->boolean(50) ? $this->faker->numerify('####-####') : null,
            'issn_e' => $this->faker->boolean(50) ? $this->faker->numerify('####-####') : null,
            'tier' => $this->faker->boolean(70) ? $this->faker->randomElement(['A1', 'A2', 'B1', 'B2', 'C']) : null,
            'citation_count' => $this->faker->numberBetween(0, 5000),
            'publish_year' => $this->faker->numberBetween(2000, 2026),
            'source_db' => $this->faker->randomElement(['scopus', 'pubmed', 'wos', 'crossref']),
            'embedding' => $this->faker->boolean(30) ? $this->faker->randomElements([0.1, 0.2, 0.3, 0.4, 0.5], 3) : null,
        ];
    }
}
