<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\HigherLowerItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    public function index() {
        $games = Game::all();
        return Inertia::render('Home', [
            'games' => $games
        ]);
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

        return Inertia::render('Games/HigherOrLower', [
            'items' => $gameItems,
        ]);
    }
}
