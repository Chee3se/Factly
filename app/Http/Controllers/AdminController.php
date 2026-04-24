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
    /**
     * Show the admin dashboard with stats, users, friends and suggestions.
     */
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

        $users = User::withCount('scores')
            ->with(['friendsTo' => function ($query) {
                $query->where('accepted', true);
            }, 'friendsFrom' => function ($query) {
                $query->where('accepted', true);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $users->getCollection()->transform(function ($user) {
            $allFriends = $user->friendsTo->merge($user->friendsFrom);
            $user->friends_count = $allFriends->unique('id')->count();
            unset($user->friendsTo, $user->friendsFrom);
            return $user;
        });

        $friends = Friend::with(['user:id,name,email,decoration', 'friendUser:id,name,email,decoration'])
            ->whereHas('user')
            ->whereHas('friendUser')
            ->whereNotNull('user_id')
            ->whereNotNull('friend_id')
            ->where(function($query) {
                $query->where('accepted', false)
                    ->orWhere(function($q) {
                        $q->where('accepted', true)
                          ->whereRaw('user_id < friend_id');
                    });
            })
            ->orderBy('accepted', 'asc')
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



    /**
     * Update a user's name, email and role from the admin panel.
     */
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

    /**
     * Delete a user. Can't delete yourself or the last admin.
     */
    public function deleteUser(User $user)
    {
        if ($user->id == auth()->id()) {
            return response()->json(['error' => 'You cannot delete your own account.'], 403);
        }

        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['error' => 'Cannot delete the last admin user.'], 400);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User deleted successfully!']);
    }

    /**
     * Manually mark a user's email as verified or clear the verification.
     */
    public function verifyUserEmail(Request $request, User $user)
    {
        $validated = $request->validate([
            'verified' => 'required|boolean',
        ]);

        if (!$validated['verified'] && $user->type === 'google') {
            return response()->json([
                'message' => "Can't unverify a Google-authenticated user.",
            ], 422);
        }

        $user->forceFill([
            'email_verified_at' => $validated['verified'] ? now() : null,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => $validated['verified']
                ? "Marked {$user->name}'s email as verified."
                : "Cleared verification on {$user->name}'s email.",
            'email_verified_at' => $user->email_verified_at,
        ]);
    }



    /**
     * Approve or decline a pending friend request as admin.
     */
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



    /**
     * Set the status of a user suggestion (pending/approved/rejected/implemented).
     */
    public function updateSuggestionStatus(Request $request, Suggestion $suggestion)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,implemented',
        ]);

        $suggestion->update([
            'status' => $validated['status'],
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id()
        ]);

        return response()->json(['success' => true, 'message' => 'Suggestion updated successfully!']);
    }
}
