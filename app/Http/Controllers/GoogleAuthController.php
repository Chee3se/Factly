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
     * Redirect the user to Google's OAuth page.
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
                // Check if the user was created with Google or regular registration
                if ($existingUser->type !== 'google') {
                    // Account exists but was created with regular registration
                    return redirect('/login')->with('error', 'An account with this email already exists. Please sign in with your email and password.');
                }

                // User exists and was created with Google, log them in
                Auth::login($existingUser);
            } else {
                // Create new Google user
                $newUser = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => bcrypt(Str::random(16)),
                    'email_verified_at' => now(),
                    'type' => 'google'
                ]);
                Auth::login($newUser);
            }

            return redirect('/');
        } catch (Throwable $e) {
            Log::error('User creation or login failed after Google authentication: ' . $e->getMessage(), ['exception' => $e]);
            return redirect('/login')->with('error', 'Could not process your Google account. Please try again or use another method.');
        }
    }
}
