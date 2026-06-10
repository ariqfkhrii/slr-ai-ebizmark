<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'user1@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'remember_token' => null,
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ]
        );

        User::firstOrCreate(
            ['email' => 'user2@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'remember_token' => null,
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ]
        );
    }
}
