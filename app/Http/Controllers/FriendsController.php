<?php

namespace App\Http\Controllers;

use App\Events\FriendRemoved;
use App\Events\FriendRequestSent;
use App\Events\FriendRequestAccepted;
use App\Events\FriendRequestDeclined;
use App\Events\LobbyInvitationSent;
use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FriendsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $friends = Friend::where('user_id', $user->id)
            ->where('accepted', true)
            ->with('friendUser')
            ->get()
            ->pluck('friendUser');

        // Updated this part to include friend_request_id
        $friendRequests = Friend::where('friend_id', $user->id)
            ->where('accepted', false)
            ->with('user')
            ->get()
            ->map(function($friendRequest) {
                $user = $friendRequest->user;
                $user->friend_request_id = $friendRequest->id;
                return $user;
            });

        $sentRequests = Friend::where('user_id', $user->id)
            ->where('accepted', false)
            ->with('friendUser')
            ->get()
            ->pluck('friendUser');

        return response()->json([
            'friends' => $friends,
            'friend_requests' => $friendRequests,
            'sent_requests' => $sentRequests
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:4|max:50'
        ]);

        $user = Auth::user();
        $query = $request->input('query');

        $existingFriendIds = Friend::where(function($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('friend_id', $user->id);
        })->pluck('user_id')
            ->merge(Friend::where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('friend_id', $user->id);
            })->pluck('friend_id'))
            ->push($user->id)
            ->unique();

        $users = User::where(function($q) use ($query) {
            $q->where('name', 'LIKE', "%{$query}%")
                ->orWhere('email', 'LIKE', "%{$query}%");
        })
            ->whereNotIn('id', $existingFriendIds)
            ->limit(20)
            ->with('decoration')
            ->get(['id', 'name', 'email', 'avatar']);

        return response()->json(['users' => $users]);
    }

    public function sendRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $user = Auth::user();
        $friendId = $request->input('friend_id');

        if ($user->id === $friendId) {
            throw ValidationException::withMessages([
                'friend_id' => ['You cannot send a friend request to yourself.']
            ]);
        }

        $existingRequest = Friend::where(function($q) use ($user, $friendId) {
            $q->where('user_id', $user->id)->where('friend_id', $friendId)
                ->orWhere('user_id', $friendId)->where('friend_id', $user->id);
        })->first();

        if ($existingRequest) {
            if ($existingRequest->accepted) {
                throw ValidationException::withMessages([
                    'friend_id' => ['You are already friends with this user.']
                ]);
            } else {
                throw ValidationException::withMessages([
                    'friend_id' => ['A friend request already exists between you and this user.']
                ]);
            }
        }

        $friendRequest = Friend::create([
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'accepted' => false
        ]);

        $friendUser = User::find($friendId);
        broadcast(new FriendRequestSent($user, $friendUser, $friendRequest));

        return response()->json([
            'message' => 'Friend request sent successfully',
            'request' => $friendRequest->load('friendUser')
        ]);
    }

    public function acceptRequest(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:friends,id'
        ]);

        $user = Auth::user();
        $requestId = $request->input('request_id');

        $friendRequest = Friend::where('id', $requestId)
            ->where('friend_id', $user->id)
            ->where('accepted', false)
            ->first();

        if (!$friendRequest) {
            return response()->json(['message' => 'Friend request not found'], 404);
        }

        $friendRequest->update(['accepted' => true]);

        Friend::create([
            'user_id' => $user->id,
            'friend_id' => $friendRequest->user_id,
            'accepted' => true
        ]);

        $requestSender = User::find($friendRequest->user_id);
        broadcast(new FriendRequestAccepted($user, $requestSender));

        return response()->json([
            'message' => 'Friend request accepted',
            'friend' => $requestSender
        ]);
    }

    public function declineRequest(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:friends,id'
        ]);

        $user = Auth::user();
        $requestId = $request->input('request_id');

        $friendRequest = Friend::where('id', $requestId)
            ->where('friend_id', $user->id)
            ->where('accepted', false)
            ->first();

        if (!$friendRequest) {
            return response()->json(['message' => 'Friend request not found'], 404);
        }

        $requestSender = User::find($friendRequest->user_id);
        $friendRequest->delete();

        broadcast(new FriendRequestDeclined($user, $requestSender));

        return response()->json(['message' => 'Friend request declined']);
    }

    public function removeFriend(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $user = Auth::user();
        $friendId = $request->input('friend_id');

        $friendUser = User::find($friendId);

        Friend::where(function($q) use ($user, $friendId) {
            $q->where('user_id', $user->id)->where('friend_id', $friendId)
                ->orWhere('user_id', $friendId)->where('friend_id', $user->id);
        })->delete();

        if ($friendUser) {
            broadcast(new FriendRemoved($user, $friendUser));
        }

        return response()->json(['message' => 'Friend removed successfully']);
    }

    public function cancelRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $user = Auth::user();
        $friendId = $request->input('friend_id');

        $friendRequest = Friend::where('user_id', $user->id)
            ->where('friend_id', $friendId)
            ->where('accepted', false)
            ->first();

        if (!$friendRequest) {
            return response()->json(['message' => 'Friend request not found'], 404);
        }

        $friendRequest->delete();

        return response()->json(['message' => 'Friend request cancelled']);
    }

    public function inviteToLobby(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
            'lobby_code' => 'required|string|max:8'
        ]);

        $user = Auth::user();
        $friendId = $request->input('friend_id');
        $lobbyCode = $request->input('lobby_code');

        $friendship = Friend::where(function($q) use ($user, $friendId) {
            $q->where('user_id', $user->id)->where('friend_id', $friendId)
                ->orWhere('user_id', $friendId)->where('friend_id', $user->id);
        })->where('accepted', true)->first();

        if (!$friendship) {
            return response()->json(['message' => 'You can only invite friends'], 403);
        }

        $lobby = \App\Models\Lobby::where('lobby_code', $lobbyCode)->with('game')->first();
        if (!$lobby) {
            return response()->json(['message' => 'Lobby not found'], 404);
        }

        $friend = User::find($friendId);

        broadcast(new LobbyInvitationSent($user, $friend, $lobbyCode, $lobby->game->name));

        return response()->json(['message' => 'Lobby invitation sent successfully']);
    }
}
