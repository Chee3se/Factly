<?php
namespace App\Http\Middleware;

use App\Models\Lobby;
use App\Models\LobbyPlayer;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsInLobby
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $game = $request->route()->parameter('game');
        $user = auth()->user();

        // Only enforce lobby requirement for multiplayer games
        if ($game->max_players > 1) {
            // Find user's current lobby
            $userLobby = LobbyPlayer::where('user_id', $user->id)->first();

            if ($userLobby) {
                $lobby = Lobby::find($userLobby->lobby_id);

                if ($lobby) {
                    // If lobby exists and hasn't started, redirect to lobby page
                    if (!$lobby->started) {
                        return redirect()->route('lobbies.game', ['game' => $game->slug])
                            ->with('message', 'Please wait for the game to start in the lobby.');
                    }

                    // If lobby has started and it's for the current game, allow access
                    if ($lobby->started && $lobby->game_id === $game->id) {
                        return $next($request);
                    }

                    // If lobby has started but for a different game, redirect to correct game
                    if ($lobby->started && $lobby->game_id !== $game->id) {
                        $correctGame = $lobby->game;
                        return redirect()->route('games.show', ['game' => $correctGame->slug])
                            ->with('message', 'Redirected to your active game.');
                    }
                }
            }

            // No lobby found or lobby is invalid, redirect to lobby selection
            return redirect()->route('lobbies.game', ['game' => $game->slug])
                ->with('message', 'You need to join a lobby to play this game.');
        }

        // Single player games don't require lobbies
        return $next($request);
    }
}
