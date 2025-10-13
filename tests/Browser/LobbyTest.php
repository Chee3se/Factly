<?php

use App\Events\LobbyMessageSent;
use App\Events\LobbyStarted;
use App\Events\PlayerReadyStatusChanged;
use App\Models\Lobby;
use App\Models\User;
use App\Models\Game;

/**
 * AUTHENTICATION TESTS
 */

it('can login', function () {
    $user = User::factory()->create();
    $page = visit('/');

    $page->click('Get Started');
    $page->click('Sign up')
        ->assertPathIs('/login');

    $page->fill('email', $user->email)
        ->fill('password', 'password')
        ->click("//*[@data-slot='button' and text()='Sign in']")
        ->assertPathIs('/');

    $page = visit('/')->click('[data-slot=avatar]')->assertSee($user->name);
    $this->assertAuthenticatedAs($user);
});

/**
 * Functional Feature: User can create a lobby
 * User Story: As a user, I need to play the game together with friends in real-time
 * to make learning more interactive and fun.
 */

it('can create a lobby for a game', function () {
    // Context: User is logged in and selects a specific game
    $user = User::factory()->create();
    $game = Game::factory()->create();

    $this->be($user);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    // Scenario: Successfully created lobby
    // When: User doesn't already own a lobby
    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby');

    // Then: New lobby is created
    $this->assertDatabaseHas('lobbies', [
        'host_user_id' => $user->id,
        'game_id' => $game->id,
    ]);

    // And: User is connected to lobby channel
    $page->assertButtonDisabled('Start Game')
        ->assertButtonEnabled('Delete Lobby');
});

it('shows error when user already owns a lobby', function () {
    // Context: User is logged in
    $user = User::factory()->create();
    $game = Game::factory()->create();

    // User already owns a lobby
    $existingLobby = Lobby::factory()->create([
        'host_user_id' => $user->id,
        'game_id' => $game->id,
    ]);

    $this->be($user);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    // Scenario: User already owns a lobby
    // When: User tries to create another lobby
    $page->click('Create ' . $game->name . ' Lobby');

    // Then: User receives error notification
    $page->assertSee('error'); // Adjust based on your error message

    // And: User is connected to existing lobby channel
    $page->assertSee($existingLobby->lobby_code);
})->only();

it('can join a lobby for a game', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $game = Game::factory()->create();

    $this->be($user1);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby')
        ->assertButtonDisabled('Start Game')
        ->assertButtonEnabled('Delete Lobby');

    $code = Lobby::where('host_user_id', $user1->id)->first()->lobby_code;

    $this->be($user2);
    $page->navigate('/')
        ->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Join Lobby')
        ->assertButtonDisabled('Join Lobby')
        ->fill('Lobby Code', $code)
        ->assertButtonEnabled('Join Lobby')
        ->click('Join Lobby')
        ->assertSee('Players');

    $this->be($user1);
    $page->assertSee($user2->name);
});

/**
 * Functional Feature: User can send messages in lobbies
 * User Story: As a user, I need to share my thoughts with other users in the lobby
 * so we can discuss the game and compare our opinions.
 */

it('can send messages in a lobby', function () {
    Event::fake();

    // Context: User is logged in, selects a game, and creates/joins lobby
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $game = Game::factory()->create();

    // User1 creates lobby
    $this->be($user1);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby');

    $code = Lobby::where('host_user_id', $user1->id)->first()->lobby_code;

    // User2 joins
    $this->be($user2);
    $page->navigate('/')
        ->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Join Lobby')
        ->fill('Lobby Code', $code)
        ->click('Join Lobby');

    // Scenario: Successfully sent message in lobby
    // When: User enters message in designated field
    $this->be($user1);
    $page->navigate('/api/lobbies/'.$game->slug);
    $page->fill('[placeholder="Type a message..."]', 'Hello from user1{enter}')
        ->submit();

    // Then: Message is sent to server
    Event::assertDispatched(LobbyMessageSent::class);

    // And: Message is saved in database
    $this->assertDatabaseHas('lobby_messages', [
        'user_id' => $user1->id,
        'message' => 'Hello from user1',
    ]);

    // And: Message is sent to lobby channel
    $page->assertSee('Hello from user1');

    // User2 sends message
    $this->be($user2);
    $page->navigate('/api/lobbies/'.$game->slug);
    $page->fill('[placeholder="Type a message..."]', 'Hi back from user2{enter}')
        ->submit();

    Event::assertDispatched(LobbyMessageSent::class);
    $page->assertSee('Hi back from user2');
});

it('shows error when message field is empty', function () {
    Event::fake();

    // Context: User is in a lobby
    $user = User::factory()->create();
    $game = Game::factory()->create();

    $this->be($user);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby');

    // Scenario: Message field is not filled
    // When: User doesn't enter message in designated field
    $page->fill('[placeholder="Type a message..."]', '{enter}')
        ->submit();

    // Then: Message is not sent to server
    Event::assertNotDispatched(LobbyMessageSent::class);

    // And: Error notification is displayed
    $page->assertSee('error'); // Adjust based on your implementation
});

/**
 * Functional Feature: User can start a game
 * User Story: As a user, I need to start the game from the lobby I'm in
 * so I can begin playing with other users.
 */

it('can start game when all players are ready', function () {
    Event::fake();

    // Context: User is logged in, selects game, and creates/joins lobby
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $game = Game::factory()->create(['min_players' => 2]);

    // User1 creates lobby
    $this->be($user1);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby');

    $code = Lobby::where('host_user_id', $user1->id)->first()->lobby_code;

    // User2 joins
    $this->be($user2);
    $page->navigate('/')
        ->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Join Lobby')
        ->fill('Lobby Code', $code)
        ->click('Join Lobby');

    // User2 marks ready
    $this->be($user2);
    $page->navigate('/api/lobbies/'.$game->slug);
    $page->click("//button[text()='Mark Ready']");
    Event::assertDispatched(PlayerReadyStatusChanged::class);

    // User1 marks ready
    $this->be($user1);
    $page->navigate('/api/lobbies/'.$game->slug);
    $page->click("//button[text()='Mark Ready']");
    Event::assertDispatched(PlayerReadyStatusChanged::class);

    // Scenario: Successfully started game in lobby
    // When: All users are ready, enough players in lobby, and lobby owner starts game
    $this->be($user1);
    $page->navigate('/api/lobbies/'.$game->slug);
    $page->assertButtonEnabled('Start Game')
        ->click('Start Game');

    // Then: Users are redirected to game
    Event::assertDispatched(LobbyStarted::class);

    // And: Lobby is closed
    $this->assertDatabaseMissing('lobbies', [
        'id' => Lobby::where('host_user_id', $user1->id)->first()->id,
        'status' => 'open',
    ]);
});

it('shows error when not enough players in lobby', function () {
    Event::fake();

    // Context: User creates lobby
    $user = User::factory()->create();
    $game = Game::factory()->create(['min_players' => 3]); // Requires 3 players

    $this->be($user);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby');

    // User marks ready
    $page->click("//button[text()='Mark Ready']");

    // Scenario: Not enough players in lobby
    // When: All users are ready but not enough players, and lobby owner tries to start
    $page->assertButtonEnabled('Start Game')
        ->click('Start Game');

    // Then: Error notification is displayed
    $page->assertSee('Not enough players'); // Adjust based on your error message

    // Game should not start
    Event::assertNotDispatched(LobbyStarted::class);
});

it('shows error when non-owner tries to start game', function () {
    Event::fake();

    // Context: Two users in lobby
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $game = Game::factory()->create(['min_players' => 2]);

    // User1 creates lobby
    $this->be($user1);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby');

    $code = Lobby::where('host_user_id', $user1->id)->first()->lobby_code;

    // User2 joins
    $this->be($user2);
    $page->navigate('/')
        ->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Join Lobby')
        ->fill('Lobby Code', $code)
        ->click('Join Lobby');

    // Both mark ready
    $page->click("//button[text()='Mark Ready']");

    $this->be($user1);
    $page->navigate('/api/lobbies/'.$game->slug);
    $page->click("//button[text()='Mark Ready']");

    // Scenario: Non-owner tries to start game
    // When: User who is not lobby owner attempts to start game
    $this->be($user2);
    $page->navigate('/api/lobbies/'.$game->slug);

    // Button should not be visible or clickable for non-owner
    $page->assertButtonMissing('Start Game'); // Or assertButtonDisabled

    // If they somehow try to start (via API), it should fail
    Event::assertNotDispatched(LobbyStarted::class);
});

it('shows notification when not all players are ready', function () {
    Event::fake();

    // Context: Two users in lobby
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $game = Game::factory()->create(['min_players' => 2]);

    // User1 creates lobby
    $this->be($user1);
    $page = visit('/');
    $page->click('Get Started');

    $page->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Create ' . $game->name . ' Lobby')
        ->click('Create ' . $game->name . ' Lobby');

    $code = Lobby::where('host_user_id', $user1->id)->first()->lobby_code;

    // User2 joins
    $this->be($user2);
    $page->navigate('/')
        ->assertSee('Play Game')
        ->click('Play Game')
        ->assertPathIs('/api/lobbies/'.$game->slug);

    $page->assertSee('Join Lobby')
        ->fill('Lobby Code', $code)
        ->click('Join Lobby');

    // Only User1 marks ready (User2 doesn't)
    $this->be($user1);
    $page->navigate('/api/lobbies/'.$game->slug);
    $page->click("//button[text()='Mark Ready']");

    // Scenario: Not all users ready for game
    // When: Enough players but one or more haven't marked ready, owner tries to start
    $page->assertButtonDisabled('Start Game'); // Button should be disabled

    // And: Notification is displayed
    $page->assertSee('Not all players are ready'); // Adjust based on message

    Event::assertNotDispatched(LobbyStarted::class);
});
