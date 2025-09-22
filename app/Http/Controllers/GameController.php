<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\HigherLowerItem;
use App\Models\QuizLadderItem;
use App\Models\Score;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GameController extends Controller
{
    public function storeSuggestion(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:100|min:3',
                'description' => 'required|string|max:500|min:10'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $suggestion = \App\Models\Suggestion::create([
                'user_id' => auth()->id(),
                'title' => $validated['title'],
                'description' => $validated['description']
            ]);

            Log::info('Game suggestion submitted', [
                'suggestion_id' => $suggestion->id,
                'user_id' => auth()->id(),
                'title' => $validated['title']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Your suggestion has been submitted successfully!',
                'suggestion_id' => $suggestion->id
            ]);

        } catch (Exception $e) {
            Log::error('Failed to save game suggestion', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'title' => $validated['title'] ?? null
            ]);

            return response()->json(['error' => 'Failed to save suggestion'], 500);
        }
    }

    public function index() {
        $games = Game::all();
        return Inertia::render('Home', [
            'games' => $games
        ]);
    }

    public function saveScore(Request $request) {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'game' => 'required|string|max:50',
            'score' => 'required|integer|min:0',
            'user_id' => 'required|integer|exists:users,id'
        ]);

        if ($validated['user_id'] !== auth()->id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        try {
            $game = Game::where('slug', $validated['game'])->first();
            if (!$game) {
                return response()->json(['error' => 'Game not found'], 404);
            }

            $newScore = Score::create([
                'user_id' => $validated['user_id'],
                'game_id' => $game->id,
                'score' => $validated['score'],
            ]);

            $bestScore = Score::where('user_id', $validated['user_id'])
                ->where('game_id', $game->id)
                ->max('score');

            return response()->json([
                'success' => true,
                'score_id' => $newScore->id,
                'best_score' => $bestScore,
                'is_new_best' => $validated['score'] >= $bestScore
            ]);

        } catch (Exception $e) {
            Log::error('Failed to save game score', [
                'error' => $e->getMessage(),
                'user_id' => $validated['user_id'],
                'game' => $validated['game'],
                'score' => $validated['score']
            ]);

            return response()->json(['error' => 'Failed to save score'], 500);
        }
    }

    public function getUserBestScore(Request $request, $gameSlug) {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $game = Game::where('slug', $gameSlug)->first();
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        $bestScore = Score::where('user_id', auth()->id())
            ->where('game_id', $game->id)
            ->max('score') ?? 0;

        return response()->json(['best_score' => $bestScore]);
    }

    public function getLeaderboard(Request $request, $gameSlug) {
        $game = Game::where('slug', $gameSlug)->first();
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        $leaderboard = Score::where('game_id', $game->id)
            ->with('user:id,name,avatar')
            ->selectRaw('user_id, MAX(score) as best_score')
            ->groupBy('user_id')
            ->orderByDesc('best_score')
            ->limit(10)
            ->get();

        return response()->json(['leaderboard' => $leaderboard]);
    }

    public function show(Game $game) {
        $methodName = str_replace('-', '_', $game->slug);

        if (method_exists($this, $methodName)) {
            return $this->$methodName($game);
        }

        return redirect('/');
    }

    public function higher_or_lower(Game $game) {
        $items = HigherLowerItem::inRandomOrder()->get();
        $gameItems = $items->take(max(10, $items->count()));

        $bestScore = 0;
        if (auth()->check()) {
            $bestScore = Score::where('user_id', auth()->id())
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
        }

        return Inertia::render('Games/HigherOrLower', [
            'items' => $gameItems,
            'bestScore' => $bestScore,
            'gameSlug' => $game->slug
        ]);
    }

    public function quiz_ladder(Game $game) {
        $items = QuizLadderItem::orderBy('difficulty')
            ->orderBy('points')
            ->orderBy('id')
            ->get();

        $bestScore = 0;
        if (auth()->check()) {
            $bestScore = Score::where('user_id', auth()->id())
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
        }

        return Inertia::render('Games/QuizLadder', [
            'game' => $game,
            'items' => $items,
            'bestScore' => $bestScore
        ]);
    }
}
