<?php

namespace Database\Factories;

use App\Models\Game;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Game>
 */
class GameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(2, true);
        $minPlayers = fake()->numberBetween(2, 5);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'thumbnail' => '/images/' . fake()->word() . '-thumbnail.png',
            'min_players' => $minPlayers,
            'max_players' => fake()->numberBetween($minPlayers, 8),
        ];
    }
}
