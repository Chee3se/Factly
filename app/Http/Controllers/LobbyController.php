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

class LobbyController extends Controller
{
    public function index()
    {
        $lobbies = Lobby::with(['game', 'host', 'players'])
            ->where('started', false)
            ->latest()
            ->get();

        return response()->json($lobbies);
    }

    public function store(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'password' => 'nullable|string|min:4|max:20',
        ]);

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
        $lobby = Lobby::where('lobby_code', $lobbyCode)->firstOrFail();
        return response()->json($lobby->load(['game', 'host', 'players']));
    }

    public function join(Request $request)
    {
        $request->validate([
            'lobby_code' => 'required|string|size:8',
            'password' => 'nullable|string',
        ]);

        $lobby = Lobby::where('lobby_code', $request->lobby_code)
            ->where('started', false)
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

        if ($lobby->players()->where('user_id', Auth::id())->exists()) {
            throw ValidationException::withMessages([
                'lobby_code' => ['You are already in this lobby.']
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
        $lobby = Lobby::where('lobby_code', $lobbyCode)->firstOrFail();
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
                $lobby->delete();
                return response()->json(['message' => 'Lobby deleted.']);
            }
        }

        broadcast(new PlayerLeftLobby($lobby, $user));

        return response()->json(['message' => 'Left lobby successfully.']);
    }

    public function toggleReady($lobbyCode)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->firstOrFail();
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
        $lobby = Lobby::where('lobby_code', $lobbyCode)->firstOrFail();
        $user = Auth::user();

        if (!$lobby->isHost($user)) {
            return response()->json(['message' => 'Only the host can start the game.'], 403);
        }

        if (!$lobby->canStart()) {
            return response()->json(['message' => 'Not all players are ready or minimum players not met.'], 400);
        }

        $lobby->update(['started' => true]);

        broadcast(new LobbyStarted($lobby));

        return response()->json(['message' => 'Game started!']);
    }

    public function kick($lobbyCode, Request $request)
    {
        $lobby = Lobby::where('lobby_code', $lobbyCode)->firstOrFail();
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
        $lobby = Lobby::where('lobby_code', $lobbyCode)->firstOrFail();
        $user = Auth::user();

        // Check if user is in the lobby
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
        $lobby = Lobby::where('lobby_code', $lobbyCode)->firstOrFail();
        $user = Auth::user();

        // Check if user is in the lobby
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
}
