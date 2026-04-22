<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Score;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Seed a demo account with all cosmetics unlocked and a spread of scores.
     *
     * Email: demo@factly.space
     * Password: DemoAccount123! (or DEMO_PASSWORD env)
     */
    public function run(): void
    {
        $password = env('DEMO_PASSWORD', 'DemoAccount123!');

        $demo = User::updateOrCreate(
            ['email' => 'demo@factly.space'],
            [
                'name' => 'Demo',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
                'role' => 'user',
                'type' => 'normal',
            ]
        );

        // Scores per game slug. High enough to unlock every decoration,
        // plus a few lower attempts to look like real play history.
        $scoresByGame = [
            'higher-or-lower' => [25, 18, 12, 7, 3],
            'factually'       => [22, 17, 14, 10, 5],
            'curators-test'   => [95, 87, 74, 62, 48],
            'quiz-ladder'     => [9, 7, 5, 3],
            'impact-auction'  => [8200, 6500, 4100, 2400],
        ];

        foreach ($scoresByGame as $slug => $scores) {
            $game = Game::where('slug', $slug)->first();
            if (!$game) {
                continue;
            }

            Score::where('user_id', $demo->id)
                ->where('game_id', $game->id)
                ->delete();

            foreach ($scores as $i => $score) {
                Score::create([
                    'user_id'    => $demo->id,
                    'game_id'    => $game->id,
                    'score'      => $score,
                    'created_at' => now()->subDays($i * 2 + 1),
                    'updated_at' => now()->subDays($i * 2 + 1),
                ]);
            }
        }
    }
}
