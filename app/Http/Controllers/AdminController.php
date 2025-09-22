<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_suggestions' => Suggestion::count(),
            'pending_suggestions' => Suggestion::where('status', 'pending')->count(),
            'approved_suggestions' => Suggestion::where('status', 'approved')->count(),
            'rejected_suggestions' => Suggestion::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats
        ]);
    }

    public function suggestions()
    {
        $suggestions = Suggestion::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Suggestions', [
            'suggestions' => $suggestions
        ]);
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

        return redirect()->back()->with('success', 'Suggestion updated successfully!');
    }
}
