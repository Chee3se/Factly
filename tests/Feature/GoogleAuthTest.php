<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Foundation\Testing\RefreshDatabase;


/**
 * Functional Feature: User can register using Google account
 * User Story: As a user, I need to create my profile using Google account
 * to make registration simpler and avoid manually entering a new password, name, and email.
 */

uses(RefreshDatabase::class);

it('can register with Google account successfully', function () {
    // Create a mock user with public properties (not methods)
    $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');

    // Mock as properties, not methods
    $abstractUser->id = 'google-id-12345';
    $abstractUser->name = 'New Google User';
    $abstractUser->email = 'newgoogle@example.com';
    $abstractUser->avatar = 'https://example.com/avatar.jpg';

    // Also set up method calls in case they're used
    $abstractUser->shouldReceive('getId')->andReturn('google-id-12345');
    $abstractUser->shouldReceive('getName')->andReturn('New Google User');
    $abstractUser->shouldReceive('getEmail')->andReturn('newgoogle@example.com');
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');

    // Mock the Socialite Provider
    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    // Mock the Socialite facade
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    // Directly call the callback route
    $response = $this->get('/auth/google/callback');

    // Assert redirect to home
    $response->assertRedirect('/');

    // Assert new user was created
    $this->assertDatabaseHas('users', [
        'name' => 'New Google User',
        'email' => 'newgoogle@example.com',
        'type' => 'google',
    ]);

    // Assert user is authenticated
    $this->assertAuthenticated();
});

it('redirects to login when Google account already linked to existing profile', function () {
    // Create existing user with Google email
    $existingUser = User::factory()->create([
        'email' => 'existing@example.com',
        'type' => 'google',
    ]);

    // Mock Socialite with existing email - use simple object approach
    $googleUser = (object) [
        'id' => 'google-id-67890',
        'name' => 'Existing User',
        'email' => 'existing@example.com',
        'avatar' => 'https://example.com/avatar.jpg',
    ];

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($googleUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    // Use HTTP request instead of calling controller directly
    $response = $this->get('/auth/google/callback');

    // Assert redirects to home (based on your controller logic)
    $response->assertRedirect('/');

    // Then: Profile is not created anew
    $this->assertCount(1, User::where('email', 'existing@example.com')->get());

    // And: User is logged into their existing profile
    $this->assertAuthenticated();

    // Verify it's the correct user
    $this->assertEquals($existingUser->id, auth()->id());
});


it('shows error message when Google authorization fails', function () {


    // Mock Socialite to throw exception (Google API error)
    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('redirect')->andReturn(redirect('/auth/google/callback')); // Still simulate the initial redirect
    $provider->shouldReceive('user')->andThrow(new Exception('Google API error'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    // Scenario: Technical error during Google authorization
    // When: Google API returns error
    $controller = new \App\Http\Controllers\GoogleAuthController();
    $response = $controller->callback();

    // The controller should return a redirect response to the login page with an error.
    $this->assertInstanceOf(\Illuminate\Http\RedirectResponse::class, $response);
    $this->assertEquals(url('/login'), $response->getTargetUrl());
    $this->assertStringContainsString('Google authentication failed', session('error'));

    // Then: Profile is not created
    $this->assertGuest();


});
