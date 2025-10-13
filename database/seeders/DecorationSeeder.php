<?php

namespace Database\Seeders;

use App\Models\Decoration;
use Illuminate\Database\Seeder;

class DecorationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Decoration::updateOrCreate(
            ['name' => 'Astronaut helmet'],
            [
                'description' => 'One small step for man, a giant leap for mankind.',
                'image_url' => '/decorations/astro.png',
                'unlock_type' => 'game_score',
                'unlock_game_slug' => 'higher-or-lower',
                'unlock_score' => 20,
                'unlock_description' => 'Beat all of the questions on Higher or Lower.',
            ]
        );

        Decoration::updateOrCreate(
            ['name' => 'Television'],
            [
                'description' => 'Display your knowledge by becoming the box of knowledge.',
                'image_url' => '/decorations/television.png',
                'unlock_type' => 'game_score',
                'unlock_game_slug' => 'factually',
                'unlock_score' => 20,
                'unlock_description' => 'Prove your knowledge by beating all of the questions on Factually.',
            ]
        );

        Decoration::updateOrCreate(
            ['name' => 'MS Paint'],
            [
                'description' => 'Show your art skills',
                'image_url' => '/decorations/mspaint.png',
                'unlock_type' => 'game_score',
                'unlock_game_slug' => 'curators-test',
                'unlock_score' => 80,
                'unlock_description' => "Prove your artistic skills by getting a rating better than 80 on the Curator's Test",
            ]
        );
    }
}
