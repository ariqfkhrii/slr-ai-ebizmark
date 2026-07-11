<?php

namespace Database\Seeders;

use App\Models\ResearchPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class ResearchPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password123'),
            ]);
        }

        ResearchPlan::create([
            'research_plan_id' => 2,
            'title' => 'Systematic Literature Review on AI in Healthcare - Scopus',
            'source_database' => 'scopus',
            'scopus_quantity' => null,
            'pubmed_quantity' => null,
            'extraction_count' => null,
            'user_id' => $user->id,
        ]);

        ResearchPlan::create([
            'research_plan_id' => 3,
            'title' => 'Systematic Literature Review on AI in Healthcare - PubMed',
            'source_database' => 'pubmed',
            'scopus_quantity' => null,
            'pubmed_quantity' => null,
            'extraction_count' => null,
            'user_id' => $user->id,
        ]);

        ResearchPlan::create([
            'research_plan_id' => 4,
            'title' => 'Mapping Study on Machine Learning for Disease Prediction',
            'source_database' => 'scopus',
            'scopus_quantity' => null,
            'pubmed_quantity' => null,
            'extraction_count' => null,
            'user_id' => $user->id,
        ]);

        ResearchPlan::create([
            'research_plan_id' => 5,
            'title' => 'Bibliometric Analysis of COVID-19 Publications',
            'source_database' => 'pubmed',
            'scopus_quantity' => null,
            'pubmed_quantity' => null,
            'extraction_count' => null,
            'user_id' => $user->id,
        ]);
    }
}