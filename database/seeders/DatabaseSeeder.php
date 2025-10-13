<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Make admin user
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'John Doe',
            'email' => 'test1@example.com',
            'password' => Hash::make('password1'),
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'James Week',
            'email' => 'test2@example.com',
            'password' => Hash::make('password2'),
            'email_verified_at' => now(),
        ]);

        // Call seeder
        $this->call([
            DecorationSeeder::class,
            HigherLowerItemSeeder::class,
            QuizLadderItemSeeder::class,
            ImpactAuctionItemSeeder::class,
            FactuallySeeder::class,
            CuratorsTestSeeder::class,
        ]);

        // Delete Laravel storage files
        Storage::disk('public')->deleteDirectory('avatars');
    }
}
