<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        $this->call(KeywordSeeder::class);
        $this->call(ResearchPlanSeeder::class);
        $this->call(PrismaDemoSeeder::class);
        $this->call(AutoReportingSeeder::class);
    }
}
