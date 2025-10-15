<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Functional Feature: User can edit profile
 * User Story: As a user, I need to edit my profile to personalize my account
 * and make it more recognizable to other users.
 */

it('can edit profile successfully', function () {
    Storage::fake('public');

    // Context: User is logged in and navigates to profile section
    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@example.com',
    ]);

    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]'); // Navigate to profile
    $page->click('Edit Profile'); // Adjust selector based on your UI

    // Scenario: Successfully edited profile
    // When: User performs one or more actions:
    // - Fills username field with unique value
    $page->fill('Username', 'newusername');

    // - Fills email field with unique value
    $page->fill('Email', 'newemail@example.com');

    // - Fills profile picture field
    // And: Profile picture data type is one of: JPEG, PNG, GIF, SVG
    $file = UploadedFile::fake()->image('avatar.jpg', 100, 100)->size(1024); // 1MB
    $page->attach('Profile Picture', $file);

    // And: File size doesn't exceed 2MB
    // Then: Profile data is updated in system
    $page->click('Save Profile');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'newusername',
        'email' => 'newemail@example.com',
    ]);

    $page->assertSee('Profile updated successfully');
});

it('can update only username', function () {
    // Context: User edits profile
    $user = User::factory()->create([
        'name' => 'OldUsername',
        'email' => 'user@example.com',
    ]);

    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Update only username
    $page->fill('Username', 'NewUsername');
    $page->click('Save Profile');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'NewUsername',
        'email' => 'user@example.com', // Email unchanged
    ]);
});

it('can update only email', function () {
    // Context: User edits profile
    $user = User::factory()->create([
        'name' => 'Username',
        'email' => 'old@example.com',
    ]);

    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Update only email
    $page->fill('Email', 'new@example.com');
    $page->click('Save Profile');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Username', // Name unchanged
        'email' => 'new@example.com',
    ]);
});

it('can update only profile picture', function () {
    Storage::fake('public');

    // Context: User edits profile
    $user = User::factory()->create();

    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Update only profile picture
    $file = UploadedFile::fake()->image('avatar.png', 100, 100)->size(1500);
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    $page->click('button[data-slot=dialog-trigger]');
    $page->click('Choose Image');
    $page->attach('input[type=file]', $file->getRealPath());
    $page->click('Crop');

    // Assert that a file was stored in the avatars directory
    $files = Storage::disk('public')->files('avatars');
    expect($files)->toHaveCount(1);
})->only();

it('accepts JPEG image format', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    $file = UploadedFile::fake()->image('avatar.jpg')->size(1024);
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    $page->assertSee('Profile updated successfully');
});

it('accepts PNG image format', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    $file = UploadedFile::fake()->image('avatar.png')->size(1024);
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    $page->assertSee('Profile updated successfully');
});

it('accepts GIF image format', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    $file = UploadedFile::fake()->create('avatar.gif', 1024, 'image/gif');
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    $page->assertSee('Profile updated successfully');
});

it('accepts SVG image format', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    $file = UploadedFile::fake()->create('avatar.svg', 1024, 'image/svg+xml');
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    $page->assertSee('Profile updated successfully');
});

it('shows error when username is already taken', function () {
    // Create existing user with taken username
    User::factory()->create(['name' => 'takenusername']);

    // Context: User tries to update profile
    $user = User::factory()->create(['name' => 'myusername']);

    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Scenario: Username or email already taken
    // When: User enters value that already exists in database (username field)
    $page->fill('Username', 'takenusername');
    $page->click('Save Profile');

    // Then: Entered data is not saved
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'myusername', // Unchanged
    ]);

    // And: Error notification is displayed
    $page->assertSee('Username is already taken'); // Adjust based on error message
});

it('shows error when email is already taken', function () {
    // Create existing user with taken email
    User::factory()->create(['email' => 'taken@example.com']);

    // Context: User tries to update profile
    $user = User::factory()->create(['email' => 'my@example.com']);

    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Scenario: Username or email already taken
    // When: User enters value that already exists in database (email field)
    $page->fill('Email', 'taken@example.com');
    $page->click('Save Profile');

    // Then: Entered data is not saved
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => 'my@example.com', // Unchanged
    ]);

    // And: Error notification is displayed
    $page->assertSee('Email is already taken'); // Adjust based on error message
});

it('shows error when image format is not supported', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Scenario: Inappropriate data format or size
    // When: User tries to upload profile picture
    // And: Image data type is not one of supported types
    $file = UploadedFile::fake()->create('avatar.bmp', 1024, 'image/bmp'); // Unsupported format
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    // Then: Profile picture is not uploaded
    Storage::disk('public')->assertMissing('avatars/' . $file->hashName());

    // And: Error notification is displayed
    $page->assertSee('Image format not supported'); // Adjust based on error message
});

it('shows error when image size exceeds 2MB', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Scenario: Inappropriate data format or size
    // When: User tries to upload profile picture
    // And: Image size exceeds 2MB
    $file = UploadedFile::fake()->image('avatar.jpg')->size(2500); // 2.5MB, exceeds limit
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    // Then: Profile picture is not uploaded
    Storage::disk('public')->assertMissing('avatars/' . $file->hashName());

    // And: Error notification is displayed
    $page->assertSee('Image size exceeds 2MB'); // Adjust based on error message
});

it('accepts image at exactly 2MB limit', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Edit Profile');

    // Edge case: exactly 2MB should be accepted
    $file = UploadedFile::fake()->image('avatar.jpg')->size(2048); // Exactly 2MB
    $page->attach('Profile Picture', $file);
    $page->click('Save Profile');

    Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    $page->assertSee('Profile updated successfully');
});
