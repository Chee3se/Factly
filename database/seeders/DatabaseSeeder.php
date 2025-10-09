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
            'role' => 'admin',
        ]);

        // Call seeder
        $this->call([
            DecorationSeeder::class,
            HigherLowerItemSeeder::class,
            QuizLadderItemSeeder::class,
            ImpactAuctionItemSeeder::class,
            FactuallySeeder::class,
        ]);

        // Delete Laravel storage files
        Storage::disk('public')->deleteDirectory('avatars');
    }
}
