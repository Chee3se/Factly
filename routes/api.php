<?php

use App\Http\Controllers\LobbyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/lobbies', [LobbyController::class, 'index']);
    Route::post('/lobbies', [LobbyController::class, 'store']);
    Route::get('/lobbies/{lobbyCode}', [LobbyController::class, 'show']);
    Route::post('/lobbies/join', [LobbyController::class, 'join']);
    Route::post('/lobbies/{lobbyCode}/leave', [LobbyController::class, 'leave']);
    Route::post('/lobbies/{lobbyCode}/ready', [LobbyController::class, 'toggleReady']);
    Route::post('/lobbies/{lobbyCode}/start', [LobbyController::class, 'start']);
    Route::post('/lobbies/{lobbyCode}/kick', [LobbyController::class, 'kick']);
    Route::post('/lobbies/{lobbyCode}/messages', [LobbyController::class, 'sendMessage']);
    Route::get('/lobbies/{lobbyCode}/messages', [LobbyController::class, 'getMessages']);
});
