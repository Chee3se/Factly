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
    /**
     * Save a score for the current user and return their new best.
     */
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

    /**
     * Get the current user's best score for a single game.
     */
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

    /**
     * Get the leaderboard for a single game as JSON.
     */
    public function getLeaderboard(Request $request, $gameSlug)
    {
        $game = Game::where('slug', $gameSlug)->first();
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        return response()->json(['leaderboard' => $this->buildLeaderboard($game)]);
    }

    /**
     * Render the Leaderboards page with top scores for every game.
     */
    public function index()
    {
        $games = Game::all();

        $leaderboards = $games->map(fn ($game) => [
            'game' => $game,
            'leaderboard' => $this->buildLeaderboard($game),
        ]);

        return Inertia::render('Leaderboards', [
            'leaderboards' => $leaderboards
        ]);
    }

    /**
     * Build the top 5 for a game, and append the current user's row if they're below that.
     */
    private function buildLeaderboard(Game $game)
    {
        $withUser = fn ($query) => $query
            ->select('id', 'name', 'avatar', 'decoration_id')
            ->with('decoration');

        $topPlayers = Score::where('game_id', $game->id)
            ->with(['user' => $withUser])
            ->selectRaw('user_id, MAX(score) as best_score')
            ->groupBy('user_id')
            ->orderByDesc('best_score')
            ->limit(5)
            ->get();

        $leaderboard = $topPlayers;

        if (!auth()->check()) {
            return $leaderboard;
        }

        $currentUserId = auth()->id();
        if ($topPlayers->contains('user_id', $currentUserId)) {
            return $leaderboard;
        }

        $userScore = Score::where('game_id', $game->id)
            ->where('user_id', $currentUserId)
            ->max('score');

        if (!$userScore) {
            return $leaderboard;
        }

        $userPosition = Score::where('game_id', $game->id)
            ->selectRaw('user_id, MAX(score) as best_score')
            ->groupBy('user_id')
            ->havingRaw('MAX(score) > ?', [$userScore])
            ->count() + 1;

        $currentUserEntry = Score::where('game_id', $game->id)
            ->where('user_id', $currentUserId)
            ->with(['user' => $withUser])
            ->selectRaw('user_id, MAX(score) as best_score')
            ->groupBy('user_id')
            ->first();

        if ($currentUserEntry) {
            $currentUserEntry->position = $userPosition;
            $leaderboard->push($currentUserEntry);
        }

        return $leaderboard;
    }
}
