<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to Google’s OAuth page.
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            Log::error('Google authentication failed during callback: ' . $e->getMessage(), ['exception' => $e]);
            return redirect('/login')->with('error', 'Google authentication failed. Please try again.');
        }

        try {
            $existingUser = User::where('email', $googleUser->email)->first();
            if ($existingUser) {
                Auth::login($existingUser);
            } else {
                $newUser = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => bcrypt(Str::random(16)), // Generate a random password for Google users
                    'email_verified_at' => now(), // Assume Google users are verified
                    'type' => 'google'
                ]);
                Auth::login($newUser);
            }

            return redirect('/');
        } catch (Throwable $e) {
            Log::error('User creation or login failed after Google authentication: ' . $e->getMessage(), ['exception' => $e]);
            Log::error('User creation or login failed after Google authentication: ' . $e->getMessage(), ['exception' => $e]);
            return redirect('/login')->with('error', 'Could not process your Google account. Please try again or use another method.');
        }
    }
}
