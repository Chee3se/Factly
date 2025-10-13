<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class CuratorsTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Game::create([
            "name" => "The Curator's Test",
            "description" => "Draw an artwork and convince an AI curator that it's truly human-made. Prove your humanity through creativity and conversation!",
            "slug" => "curators-test",
            "thumbnail" => "/images/curators-test.jpg",
            "min_players" => 1,
            "max_players" => 1,
        ]);
    }
}
