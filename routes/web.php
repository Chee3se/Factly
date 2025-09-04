<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('Home', []);
})->name('home');

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
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');

    // Profile management routes
    Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::put('/profile/password', [AuthController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [AuthController::class, 'deleteAccount'])->name('profile.destroy');

    // Avatar management routes
    Route::post('/profile/avatar/upload', [AuthController::class, 'uploadAvatar'])->name('profile.avatar.upload');

    // Session management routes
    Route::get('/profile/sessions', [AuthController::class, 'getSessions'])->name('profile.sessions');
    Route::post('/profile/logout-other-sessions', [AuthController::class, 'logoutOtherSessions'])->name('profile.logout-other-sessions');
    Route::delete('/profile/session/logout', [AuthController::class, 'logoutSession'])->name('profile.session.logout');
});

// Email verification
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');

// Verify Email
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');

// Resend email
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
