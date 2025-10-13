<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\Score;
use App\Models\Game;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\RateLimiter;
use Jenssegers\Agent\Agent;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Display the login/register page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request (login).
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Handle an incoming registration request.
     */
    /**
     * Apstrādā ienākošu reģistrācijas pieprasījumu.
     */
    public function register(Request $request): RedirectResponse
    {
        // Rate limiting to prevent too many accounts from one device
        $key = 'register:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) { // Allow 3 attempts per hour
            return back()->withErrors(['general' => 'Too many registration attempts from this device. Please try again later.']);
        }
        RateLimiter::hit($key, 3600); // 1 hour window

        // Validē lietotāja ievadītos datus
        $request->validate([
            'name' => 'required|string|max:255|unique:users',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Izveido jaunu lietotāju datubāzē ar ievadītajiem datiem
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Nosūta e-pasta verifikācijas notifikāciju
        event(new Registered($user));

        // Automātiski ielogojas kā jaunizveidotais lietotājs
        Auth::login($user);

        // Pāradresē lietotāju uz mājaslapas sākumlapu
        return redirect('/');
    }


    /**
     * Destroy an authenticated session (logout).
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function profile(): Response
    {
        $decorations = \App\Models\Decoration::all()->map(function ($decoration) {
            $decoration->is_unlocked = $this->isDecorationUnlocked($decoration, auth()->user());
            return $decoration;
        });

        return Inertia::render('Profile', [
            'sessions' => $this->getUserSessions(),
            'decorations' => $decorations,
        ]);
    }

    private function isDecorationUnlocked($decoration, $user)
    {
        if (!$decoration->unlock_type) {
            return true; // No unlock condition, always unlocked
        }

        if ($decoration->unlock_type === 'game_score') {
            $game = Game::where('slug', $decoration->unlock_game_slug)->first();
            if (!$game) {
                return false;
            }
            $maxScore = Score::where('user_id', $user->id)
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
            return $maxScore >= $decoration->unlock_score;
        }

        return false; // Unknown type, locked
    }

    /**
     * Get user's active sessions.
     */
    private function getUserSessions(): array
    {
        if (config('session.driver') !== 'database') {
            return [];
        }

        $agent = new Agent();
        $currentSessionId = session()->getId();

        return collect(
            DB::table('sessions')
                ->where('user_id', Auth::id())
                ->orderBy('last_activity', 'desc')
                ->get()
        )->map(function ($session) use ($agent, $currentSessionId) {
            $agent->setUserAgent($session->user_agent ?? '');

            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'is_current' => $session->id === $currentSessionId,
                'device' => $this->getDeviceType($agent),
                'browser' => $agent->browser() ?: 'Unknown',
                'platform' => $agent->platform() ?: 'Unknown',
                'location' => $this->getLocationFromIp($session->ip_address),
                'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
            ];
        })->toArray();
    }

    /**
     * Get device type from agent.
     */
    private function getDeviceType(Agent $agent): string
    {
        if ($agent->isTablet()) {
            return 'Tablet';
        } elseif ($agent->isMobile()) {
            return 'Mobile Device';
        } else {
            return 'Desktop Computer';
        }
    }

    /**
     * Get location from IP address (you can integrate with a service like ipinfo.io).
     */
    private function getLocationFromIp(string $ip): ?string
    {
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Local Development';
        }
        return null;
    }

    /**
     * Update the user's profile information.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        if ($user->type === 'google') {
            $user->update(['name' => $validated['name']]);
        } else {
            $user->fill($validated);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();
        }

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Upload profile avatar.
     */
    public function uploadAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($user->avatar && !str_starts_with($user->avatar, '/avatars/preset-')) {
            Storage::disk('public')->delete($user->avatar);
        }

        $avatarPath = $request->file('avatar')->store('avatars', 'public');

        $user->update([
            'avatar' => $avatarPath,
        ]);

        return back()->with('success', 'Profile picture updated successfully.');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->type === 'google') {
            return back()->withErrors([
                'password' => 'Google account users cannot change their password. Please manage your password through your Google account.',
            ]);
        }

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Update the user's decoration.
     */
    public function updateDecoration(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'decoration_id' => 'nullable|integer|exists:decorations,id',
        ]);

        if ($validated['decoration_id']) {
            $decoration = \App\Models\Decoration::find($validated['decoration_id']);
            if (!$this->isDecorationUnlocked($decoration, $user)) {
                return back()->withErrors(['decoration' => 'This decoration is locked.']);
            }
        }

        $user->update([
            'decoration_id' => $validated['decoration_id'],
        ]);

        $user->load('decoration');

        return back()->with('success', 'Profile decoration updated successfully.');
    }

    /**
     * Get user sessions.
     */
    public function getSessions(Request $request): Response
    {
        return Inertia::render('ProfileSessions', [
            'sessions' => $this->getUserSessions(),
        ]);
    }

    /**
     * Logout from all other sessions.
     */
    public function logoutOtherSessions(Request $request): RedirectResponse
    {
        if (config('session.driver') !== 'database') {
            return back()->with('error', 'Session management requires database session driver.');
        }

        DB::table('sessions')
            ->where('user_id', Auth::id())
            ->where('id', '!=', session()->getId())
            ->delete();

        return back()->with('success', 'Successfully logged out from all other sessions.');
    }

    /**
     * Logout from a specific session.
     */
    public function logoutSession(Request $request): RedirectResponse
    {
        if (config('session.driver') !== 'database') {
            return back()->with('error', 'Session management requires database session driver.');
        }

        $request->validate([
            'session_id' => 'required|string',
        ]);

        DB::table('sessions')
            ->where('user_id', Auth::id())
            ->where('id', $request->session_id)
            ->delete();

        return back()->with('success', 'Session terminated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function deleteAccount(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Your account has been deleted.');
    }
}
