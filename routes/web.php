<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\ScoreController;
use App\Models\Game;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Public routes
Route::get('/', [GameController::class, 'index'])->name('home');
Route::get('/leaderboards', [ScoreController::class, 'index'])->name('leaderboards');

// Score and leaderboard routes (public for leaderboards, auth required for saving)
Route::get('/api/games/{gameSlug}/leaderboard', [ScoreController::class, 'getLeaderboard'])->name('games.leaderboard');

Route::middleware('throttle:auth')->group(function () {
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
});

Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

// Guest routes (only accessible when not logged in)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.request');
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Lobby page route
    Route::get('/lobbies', [LobbyController::class, 'index'])->name('lobbies');

    // Game routes with lobby middleware
    Route::get('/games/{game:slug}', [GameController::class, 'show'])->name('games.show')->middleware('lobby');

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');

    // Profile management routes
    Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::put('/profile/password', [AuthController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [AuthController::class, 'deleteAccount'])->name('profile.destroy');

    // Avatar management routes
    Route::post('/profile/avatar/upload', [AuthController::class, 'uploadAvatar'])->name('profile.avatar.upload');

    // Decoration management routes
    Route::put('/profile/decoration', [AuthController::class, 'updateDecoration'])->name('profile.decoration.update');

    // Session management routes
    Route::get('/profile/sessions', [AuthController::class, 'getSessions'])->name('profile.sessions');
    Route::post('/profile/logout-other-sessions', [AuthController::class, 'logoutOtherSessions'])->name('profile.logout-other-sessions');
    Route::delete('/profile/session/logout', [AuthController::class, 'logoutSession'])->name('profile.session.logout');

    // Game score routes (authenticated only)
    Route::post('/api/save-score', [ScoreController::class, 'saveScore'])->name('games.save-score');
    Route::get('/api/games/{gameSlug}/best-score', [ScoreController::class, 'getUserBestScore'])->name('games.user-best-score');

    // Curator's Test AI chat endpoint
    Route::post('/api/games/curators-test/chat', [GameController::class, 'curatorsTestChat'])->name('games.curators-test.chat');

    // Curator's Test artwork endpoints
    Route::post('/api/games/curators-test/save-artwork', [GameController::class, 'saveCuratorsTestArtwork'])->name('games.curators-test.save-artwork');
    Route::get('/api/games/curators-test/artworks', [GameController::class, 'getCuratorsTestArtworks'])->name('games.curators-test.artworks');
    Route::get('/games/curators-test/gallery', [GameController::class, 'curatorsTestGallery'])->name('games.curators-test.gallery');

    Route::get('/lobbies/{lobbyCode}', [LobbyController::class, 'showLobby'])
        ->where('lobbyCode', '[A-Z0-9]{8}')
        ->name('lobbies.show');

    // Lobby API routes - grouped with proper API prefix
    Route::prefix('api')->group(function () {
        Route::get('/lobbies', [LobbyController::class, 'apiIndex']); // Changed to apiIndex
        Route::get('/lobbies/{game:slug}', [LobbyController::class, 'gameLobbies'])
            ->middleware(['auth'])
            ->name('lobbies.game');
        Route::get('/lobbies/current', [LobbyController::class, 'getCurrentUserLobby']);
        Route::post('/lobbies', [LobbyController::class, 'store']);
        Route::post('/lobbies/find', [LobbyController::class, 'findByCode']);
        Route::post('/lobbies/join', [LobbyController::class, 'join']);
        Route::post('/lobbies/{lobbyCode}/leave', [LobbyController::class, 'leave']);
        Route::post('/lobbies/{lobbyCode}/ready', [LobbyController::class, 'toggleReady']);
        Route::post('/lobbies/{lobbyCode}/start', [LobbyController::class, 'start']);
        Route::post('/lobbies/{lobbyCode}/kick', [LobbyController::class, 'kick']);
        Route::post('/lobbies/{lobbyCode}/messages', [LobbyController::class, 'sendMessage']);
        Route::get('/lobbies/{lobbyCode}/messages', [LobbyController::class, 'getMessages']);
        Route::get('/send-email', function () {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            try {
                Mail::raw('This is a test email sent from your Laravel application!', function ($mail) use ($user) {
                    $mail->to($user->email)->subject('Test Email');
                });

                return response()->json(['success' => true, 'message' => 'Test email sent successfully!']);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Failed to send email: ' . $e->getMessage()], 500);
            }
        });
    });
});

// Email verification
Route::get('/email/verify', function () {
    return Inertia::render('EmailVerification', []);
})->middleware('auth')->name('verification.notice');

// Verify Email
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect('/')->with('success', 'Your email address has been verified successfully!');
})->middleware(['auth'])->name('verification.verify');

// Resend email
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return redirect()->route('verification.notice')->with('resent', true);
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

Route::middleware(['auth'])->group(function () {
    Route::post('/suggestions', [GameController::class, 'storeSuggestion'])->name('suggestions.store');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::patch('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.delete');
    Route::patch('/friends/{friend}/approve', [AdminController::class, 'approveFriendRequest'])->name('friends.approve');
    Route::patch('/suggestions/{suggestion}/status', [AdminController::class, 'updateSuggestionStatus'])->name('suggestions.update-status');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/friends', [FriendsController::class, 'index'])->name('friends.index');
    Route::get('/friends/search', [FriendsController::class, 'search'])->name('friends.search');
    Route::post('/friends/send-request', [FriendsController::class, 'sendRequest'])->name('friends.send-request');
    Route::post('/friends/accept-request', [FriendsController::class, 'acceptRequest'])->name('friends.accept-request');
    Route::post('/friends/decline-request', [FriendsController::class, 'declineRequest'])->name('friends.decline-request');
    Route::delete('/friends/remove', [FriendsController::class, 'removeFriend'])->name('friends.remove');
    Route::delete('/friends/cancel-request', [FriendsController::class, 'cancelRequest'])->name('friends.cancel-request');
    Route::post('/friends/invite-to-lobby', [FriendsController::class, 'inviteToLobby'])->name('friends.invite-to-lobby');
});
