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
     // tiek izveidots jauns lietotājs
     $user = User::factory()->create([
         'name' => 'OldUsername',          // Sākotnējais lietotājvārds
         'email' => 'olduser@example.com', // Sākotnējais e-pasts
         'email_verified_at' => now()      // E-pasts ir verificēts
     ]);

     // Lietotājs tiek autentificēts
     $this->be($user);
     $page = visit('/');

     // Navigē uz profila lapu
     $page->click('Get Started');
     $page->click('[data-slot=avatar]');
     $page->click('Profile');

     // Atjauno lietotājvārdu un e-pastu
     $page->fill('Username', 'NewUsername');
     $page->fill('Email', 'user@example.com');
     $page->click('Save Changes');

     // Pārbauda, vai izmaiņas saglabātas datubāzē
     $this->assertDatabaseHas('users', [
         'id' => $user->id,
         'name' => 'NewUsername',
         'email' => 'user@example.com',
     ]);

     // Pārbauda, vai tiek rādīts e-pasta verifikācijas paziņojums
     $page->assertSee('Verify Your Email');
 });


it('can update only username', function () {
    // Context: User edits profile
    $user = User::factory()->create([
        'name' => 'OldUsername',
        'email' => 'user@example.com',
        'email_verified_at' => now()
    ]);

    $this->be($user);
    $page = visit('/');

    $page->click('Get Started');
    $page->click('[data-slot=avatar]');
    $page->click('Profile');

    // Update only username
    $page->fill('Username', 'NewUsername');
    $page->click('Save Changes');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'NewUsername',
        'email' => 'user@example.com',
    ]);

    $page->assertDontSee('Verify Your Email');
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
    $page->click('Profile');

    // Update only email
    $page->fill('Email', 'new@example.com');
    $page->click('Save Changes');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Username', // Name unchanged
        'email' => 'new@example.com',
    ]);

    $page->assertSee('Verify Your Email');
});
