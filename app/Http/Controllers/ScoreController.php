<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Score;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScoreController extends Controller
{
    public function saveScore(Request $request)
    {
        $validated = $request->validate([
            'game' => 'required|string|max:50',
            'score' => 'required|integer|min:0',
        ]);

        try {
            $game = Game::where('slug', $validated['game'])->first();
            if (!$game) {
                return response()->json(['error' => 'Game not found'], 404);
            }

            $userId = auth()->id();

            // Read previous best before inserting so is_new_best is correct.
            $previousBest = Score::where('user_id', $userId)
                ->where('game_id', $game->id)
                ->max('score');

            $newScore = Score::create([
                'user_id' => $userId,
                'game_id' => $game->id,
                'score' => $validated['score'],
            ]);

            $bestScore = max($validated['score'], $previousBest ?? 0);

            return response()->json([
                'success' => true,
                'score_id' => $newScore->id,
                'best_score' => $bestScore,
                'is_new_best' => $previousBest === null || $validated['score'] > $previousBest,
            ]);

        } catch (Exception $e) {
            Log::error('Failed to save game score', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'game' => $validated['game'],
            ]);

            return response()->json(['error' => 'Failed to save score'], 500);
        }
    }

    public function getUserBestScore(Request $request, $gameSlug)
    {
        $game = Game::where('slug', $gameSlug)->first();
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        $bestScore = Score::where('user_id', auth()->id())
            ->where('game_id', $game->id)
            ->max('score') ?? 0;

        return response()->json(['best_score' => $bestScore]);
    }

    public function getLeaderboard(Request $request, $gameSlug)
    {
        $game = Game::where('slug', $gameSlug)->first();
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        // Get top 5 players
        $topPlayers = Score::where('game_id', $game->id)
            ->with(['user' => function ($query) {
                $query->select('id', 'name', 'avatar', 'decoration_id')->with('decoration');
            }])
            ->selectRaw('user_id, MAX(score) as best_score')
            ->groupBy('user_id')
            ->orderByDesc('best_score')
            ->limit(5)
            ->get();

        $leaderboard = $topPlayers;

        // If user is authenticated, check if they're in top 5
        if (auth()->check()) {
            $currentUserId = auth()->id();
            $userInTop5 = $topPlayers->contains('user_id', $currentUserId);

            if (!$userInTop5) {
                // Get current user's best score and position
                $userScore = Score::where('game_id', $game->id)
                    ->where('user_id', $currentUserId)
                    ->max('score');

                if ($userScore) {
                    // Calculate user's position
                    $userPosition = Score::where('game_id', $game->id)
                        ->selectRaw('user_id, MAX(score) as best_score')
                        ->groupBy('user_id')
                        ->havingRaw('MAX(score) > ?', [$userScore])
                        ->count() + 1;

                    // Add current user to leaderboard
                    $currentUserEntry = Score::where('game_id', $game->id)
                        ->where('user_id', $currentUserId)
                        ->with(['user' => function ($query) {
                            $query->select('id', 'name', 'avatar', 'decoration_id')->with('decoration');
                        }])
                        ->selectRaw('user_id, MAX(score) as best_score')
                        ->groupBy('user_id')
                        ->first();

                    if ($currentUserEntry) {
                        $currentUserEntry->position = $userPosition;
                        $leaderboard->push($currentUserEntry);
                    }
                }
            }
        }

        return response()->json(['leaderboard' => $leaderboard]);
    }

    public function index()
    {
        $games = Game::all();

        $leaderboards = $games->map(function ($game) {
            // Get top 5 players
            $topPlayers = Score::where('game_id', $game->id)
                ->with(['user' => function ($query) {
                    $query->select('id', 'name', 'avatar', 'decoration_id')->with('decoration');
                }])
                ->selectRaw('user_id, MAX(score) as best_score')
                ->groupBy('user_id')
                ->orderByDesc('best_score')
                ->limit(5)
                ->get();

            $leaderboard = $topPlayers;

            // If user is authenticated, check if they're in top 5
            if (auth()->check()) {
                $currentUserId = auth()->id();
                $userInTop5 = $topPlayers->contains('user_id', $currentUserId);

                if (!$userInTop5) {
                    // Get current user's best score and position
                    $userScore = Score::where('game_id', $game->id)
                        ->where('user_id', $currentUserId)
                        ->max('score');

                    if ($userScore) {
                        // Calculate user's position
                        $userPosition = Score::where('game_id', $game->id)
                            ->selectRaw('user_id, MAX(score) as best_score')
                            ->groupBy('user_id')
                            ->havingRaw('MAX(score) > ?', [$userScore])
                            ->count() + 1;

                        // Add current user to leaderboard
                        $currentUserEntry = Score::where('game_id', $game->id)
                            ->where('user_id', $currentUserId)
                            ->with(['user' => function ($query) {
                                $query->select('id', 'name', 'avatar', 'decoration_id')->with('decoration');
                            }])
                            ->selectRaw('user_id, MAX(score) as best_score')
                            ->groupBy('user_id')
                            ->first();

                        if ($currentUserEntry) {
                            $currentUserEntry->position = $userPosition;
                            $leaderboard->push($currentUserEntry);
                        }
                    }
                }
            }

            return [
                'game' => $game,
                'leaderboard' => $leaderboard
            ];
        });

        return Inertia::render('Leaderboards', [
            'leaderboards' => $leaderboards
        ]);
    }
}
