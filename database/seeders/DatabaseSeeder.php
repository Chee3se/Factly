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
        // Make admin user. Credentials come from config so `config:cache` doesn't
        // silently return null and break seeding.
        $adminEmail = config('app.admin_email');
        $adminPassword = config('app.admin_password');

        if (!$adminPassword) {
            $this->command->warn('ADMIN_PASSWORD is not set — skipping admin user creation.');
        } else {
            User::updateOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => 'Admin',
                    'password' => Hash::make($adminPassword),
                    'email_verified_at' => now(),
                    'role' => 'admin',
                ]
            );
        }

        // Call seeder
        $this->call([
            DecorationSeeder::class,
            HigherLowerItemSeeder::class,
            QuizLadderItemSeeder::class,
            ImpactAuctionItemSeeder::class,
            FactuallySeeder::class,
            CuratorsTestSeeder::class,
            DemoUserSeeder::class,
        ]);

        // Wipe dev avatars so local seed runs start clean. Never do this on
        // a real environment — that's user data.
        if (app()->environment('local')) {
            Storage::disk('public')->deleteDirectory('avatars');
        }
    }
}
