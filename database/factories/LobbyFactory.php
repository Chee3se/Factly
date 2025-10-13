<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\Lobby;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lobby>
 */
class LobbyFactory extends Factory
{
    protected $model = Lobby::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'game_id' => Game::factory(),
            'host_user_id' => User::factory(),
            'lobby_code' => $this->generateUniqueLobbyCode(),
            'password' => null,
            'started' => false,
        ];
    }

    /**
     * Generate a unique lobby code (8 characters: uppercase letters and numbers)
     */
    private function generateUniqueLobbyCode(): string
    {
        do {
            $code = strtoupper(Str::random(4)) . rand(1000, 9999);
        } while (Lobby::where('lobby_code', $code)->exists());

        return $code;
    }

    /**
     * Indicate that the lobby is password protected.
     */
    public function withPassword(string $password = 'password'): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => bcrypt($password),
        ]);
    }

    /**
     * Indicate that the lobby has been started.
     */
    public function started(): static
    {
        return $this->state(fn (array $attributes) => [
            'started' => true,
        ]);
    }

    /**
     * Set a specific lobby code.
     */
    public function withCode(string $code): static
    {
        return $this->state(fn (array $attributes) => [
            'lobby_code' => $code,
        ]);
    }

    /**
     * Set a specific game.
     */
    public function forGame(Game $game): static
    {
        return $this->state(fn (array $attributes) => [
            'game_id' => $game->id,
        ]);
    }

    /**
     * Set a specific host user.
     */
    public function hostedBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'host_user_id' => $user->id,
        ]);
    }
}
