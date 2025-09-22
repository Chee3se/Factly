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

        if ($game->max_players > 1) {
            $userLobby = LobbyPlayer::where('user_id', $user->id)->first();

            if ($userLobby) {
                $lobby = Lobby::find($userLobby->lobby_id);

                if ($lobby && !$lobby->started) {
                    return redirect('/lobbies');
                }
            }
            else {
                return redirect('/lobbies');
            }
        }

        return $next($request);
    }
}
