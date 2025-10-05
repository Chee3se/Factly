<?php

namespace App\Http\Controllers;

use App\Events\LobbyStarted;
use App\Events\PlayerJoinedLobby;
use App\Events\PlayerLeftLobby;
use App\Events\PlayerReadyStatusChanged;
use App\Events\LobbyMessageSent;
use App\Models\Game;
use App\Models\Lobby;
use App\Models\LobbyMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LobbyController extends Controller
{
    /**
     * Display the lobbies page
     */
    public function index()
    {
        return Inertia::render('Lobbies', []);
    }

    /**
     * Display the lobbies page for a specific game
     */
    public function gameLobbies($gameSlug)
    {
        $game = Game::where('slug', $gameSlug)->first();

        if (!$game) {
            return redirect()->route('lobbies')->with('error', 'Game not found.');
        }

        return Inertia::render('Lobbies', [
            'auth' => [
                'user' => Auth::user()
            ],
            'game' => [
                'id' => $game->id,
                'name' => $game->name,
                'slug' => $game->slug
            ],
            'hideGameSelection' => true
        ]);
    }

    /**
     * Get lobbies list for API - only show non-started lobbies for joining
     */
    public function apiIndex()
    {
        $user = Auth::user();

        // Only show non-started lobbies for the main lobby list
        $lobbies = Lobby::with(['game', 'host', 'players'])
            ->where('started', false)
            ->latest()
            ->get();

        // Check if user is already in ANY lobby (including started ones)
        $userLobby = Lobby::with(['game', 'host', 'players'])
            ->whereHas('players', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        return response()->json([
            'lobbies' => $lobbies,
            'user_lobby' => $userLobby
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'game_id' => 'required|exists:games,id',
            'password' => 'nullable|string|min:4|max:20',
        ]);

        // Check if user is already in ANY lobby
        $existingLobby = Lobby::whereHas('players', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->first();

        if ($existingLobby) {
            throw ValidationException::withMessages([
                'game_id' => ['You are already in a lobby. Please leave your current lobby first.']
            ]);
        }

        // Check if user is already hosting a lobby
        $hostingLobby = Lobby::where('host_user_id', $user->id)->first();
        if ($hostingLobby) {
            throw ValidationException::withMessages([
                'game_id' => ['You are already hosting a lobby. Please close it first.']
            ]);
        }

        $lobby = Lobby::create([
            'game_id' => $request->game_id,
            'host_user_id' => Auth::id(),
            'lobby_code' => Lobby::generateCode(),
            'password' => $request->password ? Hash::make($request->password) : null,
        ]);

        // Host automatically joins their own lobby
        $lobby->players()->attach(Auth::id(), [
            'joined_at' => now(),
            'ready' => false
        ]);

        return response()->json($lobby->load(['game', 'host', 'players']));
    }

    public function show($lobbyCode)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        // Check if the requesting user is actually in this lobby
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $userInLobby = $lobby->players()->where('user_id', $user->id)->exists();

        if (!$userInLobby) {
            // Log for debugging
            \Log::warning('User not in lobby', [
                'user_id' => $user->id,
                'lobby_code' => $lobbyCode,
                'lobby_players' => $lobby->players()->pluck('user_id')->toArray()
            ]);

            return response()->json(['message' => 'You are not in this lobby'], 403);
        }

        return response()->json($lobby->load(['game', 'host', 'players']));
    }

    public function join(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'lobby_code' => 'required|string|size:8',
            'password' => 'nullable|string',
        ]);

        // Check if user is already in ANY lobby
        $existingLobby = Lobby::whereHas('players', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->first();

        if ($existingLobby) {
            throw ValidationException::withMessages([
                'lobby_code' => ['You are already in a lobby. Please leave your current lobby first.']
            ]);
        }

        $lobby = Lobby::where('lobby_code', $request->lobby_code)
            ->where('started', false) // Only allow joining non-started lobbies
            ->first();

        if (!$lobby) {
            throw ValidationException::withMessages([
                'lobby_code' => ['Lobby not found or already started.']
            ]);
        }

        if ($lobby->isFull()) {
            throw ValidationException::withMessages([
                'lobby_code' => ['Lobby is full.']
            ]);
        }

        if ($lobby->password && !Hash::check($request->password, $lobby->password)) {
            throw ValidationException::withMessages([
                'password' => ['Incorrect password.']
            ]);
        }

        $lobby->players()->attach(Auth::id(), [
            'joined_at' => now(),
            'ready' => false
        ]);

        broadcast(new PlayerJoinedLobby($lobby, Auth::user()));

        return response()->json($lobby->load(['game', 'host', 'players']));
    }

    public function leave($lobbyCode)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        $user = Auth::user();

        if (!$lobby->players()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not in this lobby.'], 400);
        }

        $lobby->players()->detach($user->id);

        // If host leaves, transfer host to another player or delete lobby
        if ($lobby->isHost($user)) {
            $newHost = $lobby->players()->first();
            if ($newHost) {
                $lobby->update(['host_user_id' => $newHost->id]);
            } else {
                // Delete lobby if no players left
                $lobby->delete();
                return response()->json(['message' => 'Lobby deleted.']);
            }
        }

        broadcast(new PlayerLeftLobby($lobby, $user));

        return response()->json(['message' => 'Left lobby successfully.']);
    }

    public function toggleReady($lobbyCode)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        $user = Auth::user();
        $player = $lobby->players()->where('user_id', $user->id)->first();

        if (!$player) {
            return response()->json(['message' => 'You are not in this lobby.'], 400);
        }

        $newReadyStatus = !$player->pivot->ready;
        $lobby->players()->updateExistingPivot($user->id, ['ready' => $newReadyStatus]);

        broadcast(new PlayerReadyStatusChanged($lobby, $user, $newReadyStatus));

        return response()->json(['ready' => $newReadyStatus]);
    }

    public function start($lobbyCode)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        $user = Auth::user();

        if (!$lobby->isHost($user)) {
            return response()->json(['message' => 'Only the host can start the game.'], 403);
        }

        if (!$lobby->canStart()) {
            return response()->json(['message' => 'Not all players are ready or minimum players not met.'], 400);
        }

        $lobby->update(['started' => true]);

        $lobby->load(['game', 'host', 'players']);

        broadcast(new LobbyStarted($lobby));

        return response()->json([
            'message' => 'Game started!',
            'lobby' => $lobby
        ]);
    }

    public function kick($lobbyCode, Request $request)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $user = Auth::user();
        $targetUserId = $request->user_id;

        if (!$lobby->isHost($user)) {
            return response()->json(['message' => 'Only the host can kick players.'], 403);
        }

        if ($targetUserId === $user->id) {
            return response()->json(['message' => 'You cannot kick yourself.'], 400);
        }

        $targetUser = $lobby->players()->where('user_id', $targetUserId)->first();
        if (!$targetUser) {
            return response()->json(['message' => 'User is not in this lobby.'], 400);
        }

        $lobby->players()->detach($targetUserId);

        broadcast(new PlayerLeftLobby($lobby, $targetUser));

        return response()->json(['message' => 'Player kicked successfully.']);
    }

    public function sendMessage($lobbyCode, Request $request)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        $user = Auth::user();

        // Check if user is in the lobby (allow messages in started lobbies too)
        if (!$lobby->players()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not in this lobby.'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $message = LobbyMessage::create([
            'lobby_id' => $lobby->id,
            'user_id' => $user->id,
            'message' => $request->message,
        ]);

        $messageData = $message->load('user');

        broadcast(new LobbyMessageSent($lobby, $messageData));

        return response()->json($messageData);
    }

    public function getMessages($lobbyCode)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        $user = Auth::user();

        // Check if user is in the lobby (allow access to started lobbies too)
        if (!$lobby->players()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not in this lobby.'], 403);
        }

        $messages = $lobby->messages()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->limit(50) // Limit to last 50 messages
            ->get();

        return response()->json($messages);
    }

    // Updated to include started lobbies for users already in them
    public function findByCode(Request $request)
    {
        $request->validate([
            'lobby_code' => 'required|string|size:8'
        ]);

        $user = Auth::user();

        $lobby = Lobby::where('lobby_code', $request->lobby_code)
            ->with(['game', 'host', 'players'])
            ->first();

        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        // Check if the requesting user is actually in this lobby
        $userInLobby = $lobby->players()->where('user_id', $user->id)->exists();

        if (!$userInLobby) {
            return response()->json(['message' => 'You are not in this lobby'], 403);
        }

        return response()->json($lobby);
    }

    /**
     * Get current user's active lobby (including started ones)
     */
    public function getCurrentUserLobby()
    {
        $user = Auth::user();

        // Find any lobby where the user is a player (including started ones)
        $lobby = Lobby::with(['game', 'host', 'players'])
            ->whereHas('players', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (!$lobby) {
            return response()->json(['message' => 'No active lobby found'], 404);
        }

        return response()->json($lobby);
    }

    /**
     * Show a specific lobby page by code (for direct links/invitations)
     */
    public function showLobby($lobbyCode)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)
            ->with(['game', 'host', 'players'])
            ->first();

        if (!$lobby) {
            return redirect()->route('lobbies')->with('error', 'Lobby not found.');
        }

        $user = Auth::user();

        // Check if user is already in this lobby
        $userInLobby = $lobby->players()->where('user_id', $user->id)->exists();

        if (!$userInLobby) {
            // Check if user is in ANY other lobby first
            $existingLobby = Lobby::whereHas('players', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->first();

            if ($existingLobby) {
                // If they're in a different lobby, remove them from it first
                $existingLobby->players()->detach($user->id);
                broadcast(new PlayerLeftLobby($existingLobby, $user));
            }

            // If lobby is started, redirect to general lobbies
            if ($lobby->started) {
                return redirect()->route('lobbies')->with('error', 'This lobby has already started.');
            }

            // If lobby is full, redirect to general lobbies
            if ($lobby->isFull()) {
                return redirect()->route('lobbies')->with('error', 'This lobby is full.');
            }

            // Auto-join the user to the lobby
            try {
                $lobby->players()->attach($user->id, [
                    'joined_at' => now(),
                    'ready' => false
                ]);

                broadcast(new PlayerJoinedLobby($lobby, $user));
            } catch (\Exception $e) {
                return redirect()->route('lobbies')->with('error', 'Failed to join lobby.');
            }
        }

        // If user is in this lobby and it's started, redirect to the game
        if ($userInLobby && $lobby->started) {
            return redirect()->route('games.show', ['game' => $lobby->game->slug])
                ->with('lobby_code', $lobby->lobby_code);
        }

        // Redirect to the game's lobby page
        return redirect()->route('lobbies.game', ['game' => $lobby->game->slug]);
    }
}
