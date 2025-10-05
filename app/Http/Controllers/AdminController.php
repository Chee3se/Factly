<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\Game;
use App\Models\Suggestion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_friends' => Friend::where('accepted', true)->whereRaw('user_id < friend_id')->count(),
            'pending_friend_requests' => Friend::where('accepted', false)->count(),
            'total_games' => Game::count(),
            'total_scores' => \App\Models\Score::count(),
            'total_suggestions' => Suggestion::count(),
            'pending_suggestions' => Suggestion::where('status', 'pending')->count(),
            'approved_suggestions' => Suggestion::where('status', 'approved')->count(),
            'rejected_suggestions' => Suggestion::where('status', 'rejected')->count(),
        ];

        // Load all data for the unified dashboard
        $users = User::withCount('scores')
            ->with(['friendsTo' => function ($query) {
                $query->where('accepted', true);
            }, 'friendsFrom' => function ($query) {
                $query->where('accepted', true);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Add friends count to each user
        $users->getCollection()->transform(function ($user) {
            $allFriends = $user->friendsTo->merge($user->friendsFrom);
            $user->friends_count = $allFriends->unique('id')->count();
            unset($user->friendsTo, $user->friendsFrom);
            return $user;
        });

        $friends = Friend::with(['user:id,name,email', 'friendUser:id,name,email'])
            ->whereHas('user')
            ->whereHas('friendUser')
            ->whereNotNull('user_id')
            ->whereNotNull('friend_id')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $suggestions = Suggestion::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'users' => $users,
            'friends' => $friends,
            'suggestions' => $suggestions
        ]);
    }



    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:20|unique:users,name,' . $user->id,
            'email' => 'required|email|max:100|unique:users,email,' . $user->id,
            'role' => 'required|in:user,admin',
        ]);

        if ($user->id == auth()->id() && $validated['role'] != $user->role) {
            return response()->json(['error' => 'You cannot change your own role.'], 403);
        }

        $user->update($validated);

        return response()->json(['success' => true, 'message' => 'User updated successfully!']);
    }

    public function deleteUser(User $user)
    {
        if ($user->id == auth()->id()) {
            return response()->json(['error' => 'You cannot delete your own account.'], 403);
        }

        // Prevent deleting the last admin
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['error' => 'Cannot delete the last admin user.'], 400);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User deleted successfully!']);
    }



    public function approveFriendRequest(Request $request, Friend $friend)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,decline'
        ]);

        if ($validated['action'] === 'approve') {
            $friend->update(['accepted' => true]);
            $message = 'Friend request approved.';
        } else {
            $friend->delete();
            $message = 'Friend request declined.';
        }

        return response()->json(['success' => true, 'message' => $message]);
    }



    public function updateSuggestionStatus(Request $request, Suggestion $suggestion)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,reviewing,approved,rejected,implemented',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        $suggestion->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id()
        ]);

        return response()->json(['success' => true, 'message' => 'Suggestion updated successfully!']);
    }
}
