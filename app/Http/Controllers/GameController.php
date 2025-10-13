<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameItem;
use App\Models\Score;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    public function storeSuggestion(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:100|min:3',
                'description' => 'required|string|max:500|min:10'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $suggestion = \App\Models\Suggestion::create([
                'user_id' => auth()->id(),
                'title' => $validated['title'],
                'description' => $validated['description']
            ]);

            Log::info('Game suggestion submitted', [
                'suggestion_id' => $suggestion->id,
                'user_id' => auth()->id(),
                'title' => $validated['title']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Your suggestion has been submitted successfully!',
                'suggestion_id' => $suggestion->id
            ]);

        } catch (Exception $e) {
            Log::error('Failed to save game suggestion', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'title' => $validated['title'] ?? null
            ]);

            return response()->json(['error' => 'Failed to save suggestion'], 500);
        }
    }

    public function index()
    {
        $games = Game::all();
        return Inertia::render('Home', [
            'games' => $games,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }



    public function show(Game $game)
    {
        $methodName = str_replace('-', '_', $game->slug);

        if (method_exists($this, $methodName)) {
            return $this->$methodName($game);
        }

        return redirect('/');
    }

    public function higher_or_lower(Game $game)
    {
        $gameItems = GameItem::where('game_id', $game->id)
            ->inRandomOrder()
            ->get();

        // Transform the items to extract the value data and maintain the same structure
        $items = $gameItems->map(function ($gameItem) {
            $itemData = $gameItem->value; // Already decoded due to JSON casting
            $itemData['id'] = $gameItem->id; // Add the GameItem ID if needed
            return $itemData;
        });

        // Take at least 10 items, or all available items if less than 10
        $items = $items->take(max(10, $items->count()));

        $bestScore = 0;
        if (auth()->check()) {
            $bestScore = Score::where('user_id', auth()->id())
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
        }

        return Inertia::render('Games/HigherOrLower', [
            'items' => $items,
            'bestScore' => $bestScore,
            'gameSlug' => $game->slug
        ]);
    }

    public function quiz_ladder(Game $game)
    {
        $gameItems = GameItem::where('game_id', $game->id)
            ->get();

        $items = $gameItems->map(function ($gameItem) {
            $itemData = $gameItem->value;
            $itemData['id'] = $gameItem->id;
            return $itemData;
        });

        $items = $items->sortBy(function ($item) {
            $difficultyOrder = ['easy' => 1, 'medium' => 2, 'hard' => 3];
            return [
                $difficultyOrder[$item['difficulty']] ?? 4,
                $item['points'] ?? 0,
                $item['id'] ?? 0
            ];
        })->values();

        $bestScore = 0;
        if (auth()->check()) {
            $bestScore = Score::where('user_id', auth()->id())
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
        }

        // Check if user is coming from a lobby (via URL parameter)
        $lobbyCode = request()->get('lobby');
        $lobby = null;

        if ($lobbyCode && auth()->check()) {
            $lobby = \App\Models\Lobby::where('lobby_code', $lobbyCode)
                ->with(['game', 'host', 'players'])
                ->whereHas('players', function ($query) {
                    $query->where('user_id', auth()->id());
                })
                ->first();
        }

        return Inertia::render('Games/QuizLadder', [
            'game' => array_merge($game->toArray(), [
                'lobby_code' => $lobbyCode,
                'lobby' => $lobby
            ]),
            'items' => $items,
            'bestScore' => $bestScore
        ]);
    }

    public function impact_auction(Game $game): Response
    {
        $gameItems = GameItem::where('game_id', $game->id)
            ->get();

        $items = $gameItems->map(function ($gameItem) {
            $itemData = $gameItem->value;
            $itemData['id'] = $gameItem->id;
            return $itemData;
        });

        // Shuffle items for randomness in multiplayer
        $items = $items->shuffle()->values();

        $bestScore = 0;
        if (auth()->check()) {
            $bestScore = Score::where('user_id', auth()->id())
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
        }

        // Check if user is coming from a lobby
        $lobbyCode = request()->get('lobby');
        $lobby = null;

        if ($lobbyCode && auth()->check()) {
            $lobby = \App\Models\Lobby::where('lobby_code', $lobbyCode)
                ->with(['game', 'host', 'players'])
                ->whereHas('players', function ($query) {
                    $query->where('user_id', auth()->id());
                })
                ->first();
        }

        return Inertia::render('Games/ImpactAuction', [
            'game' => array_merge($game->toArray(), [
                'lobby_code' => $lobbyCode,
                'lobby' => $lobby
            ]),
            'items' => $items,
            'bestScore' => $bestScore
        ]);
    }

    public function factually(Game $game)
    {
        $gameItems = GameItem::where('game_id', $game->id)
            ->inRandomOrder()
            ->get();

        $items = $gameItems->map(function ($gameItem) {
            $itemData = $gameItem->value;
            $itemData['id'] = $gameItem->id;
            return $itemData;
        });

        $items = $items->take(max(10, $items->count()));

        $bestScore = 0;
        if (auth()->check()) {
            $bestScore = Score::where('user_id', auth()->id())
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
        }

        return Inertia::render('Games/Factually', [
            'items' => $items,
            'bestScore' => $bestScore,
            'gameSlug' => $game->slug
        ]);
    }

    public function curators_test(Game $game)
    {
        // List of simple drawing prompts
        $drawingPrompts = [
            'happiness', 'tree', 'house', 'sun', 'love', 'freedom',
            'cat', 'mountain', 'ocean', 'dream', 'music', 'friendship',
            'hope', 'peace', 'journey', 'home', 'family', 'courage',
            'star', 'flower', 'bird', 'smile', 'heart', 'rain'
        ];

        $word = $drawingPrompts[array_rand($drawingPrompts)];

        $bestScore = 0;
        if (auth()->check()) {
            $bestScore = Score::where('user_id', auth()->id())
                ->where('game_id', $game->id)
                ->max('score') ?? 0;
        }

        return Inertia::render('Games/CuratorsTest', [
            'word' => $word,
            'bestScore' => $bestScore,
            'gameSlug' => $game->slug
        ]);
    }

    public function curatorsTestChat(Request $request)
    {
        try {
            $validated = $request->validate([
                'messages' => 'required|array',
                'messages.*.role' => 'required|string|in:user,assistant,system',
                'messages.*.content' => 'required|string',
                'artwork_subject' => 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Curator chat validation error', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'error' => 'Invalid request data',
                'details' => $e->errors()
            ], 422);
        }

        try {
            $openAiUrl = env('OPEN_AI_URL', 'https://api.openai.com/v1/chat/completions');
            // Ensure the URL ends with /chat/completions for compatibility
            if (!str_ends_with($openAiUrl, '/chat/completions')) {
                $openAiUrl = rtrim($openAiUrl, '/') . '/chat/completions';
            }
            $openAiKey = env('OPEN_AI_KEY');
            $modelId = env('OPEN_AI_MODEL_ID', 'gpt-3.5-turbo');

            Log::info('Curator chat request', [
                'url' => $openAiUrl,
                'model' => $modelId,
                'message_count' => count($validated['messages']),
                'has_api_key' => !empty($openAiKey)
            ]);

            if (!$openAiKey) {
                Log::error('OpenAI API key not configured');
                return response()->json([
                    'error' => 'OpenAI API key not configured'
                ], 500);
            }

            $payload = [
                'model' => $modelId,
                'messages' => $validated['messages'],
                'temperature' => 0.8,
                'max_tokens' => 500,
            ];

            Log::info('Sending request to API', [
                'url' => $openAiUrl,
                'model' => $modelId,
                'message_count' => count($validated['messages']),
                'payload_keys' => array_keys($payload),
                'first_message_preview' => isset($validated['messages'][0]) ? substr($validated['messages'][0]['content'], 0, 100) . '...' : 'none'
            ]);

            $headers = [
                'Authorization' => 'Bearer ' . $openAiKey,
                'Content-Type' => 'application/json',
            ];

            Log::info('Request headers', [
                'has_authorization' => !empty($headers['Authorization']),
                'auth_preview' => !empty($openAiKey) ? substr($openAiKey, 0, 10) . '...' : 'empty'
            ]);

            $response = \Illuminate\Support\Facades\Http::withHeaders($headers)->timeout(30)->post($openAiUrl, $payload);

            Log::info('API response received', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'headers' => $response->headers(),
                'body' => $response->body()
            ]);

            if (!$response->successful()) {
                Log::error('OpenAI API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'headers' => $response->headers()
                ]);
                return response()->json([
                    'error' => 'Failed to get response from AI',
                    'status' => $response->status()
                ], 500);
            }

            $data = $response->json();

            Log::info('API response parsed', [
                'has_choices' => isset($data['choices']),
                'choices_count' => isset($data['choices']) ? count($data['choices']) : 0,
                'has_content' => isset($data['content']),
                'has_message' => isset($data['message']),
                'full_response' => $data
            ]);

            // Handle different API response formats
            $message = null;

            // OpenAI format: choices[0].message.content
            if (isset($data['choices']) && isset($data['choices'][0]['message']['content'])) {
                $message = $data['choices'][0]['message']['content'];
            }
            // Direct content format (some APIs)
            elseif (isset($data['content'])) {
                $message = $data['content'];
            }
            // Direct message format
            elseif (isset($data['message'])) {
                $message = $data['message'];
            }
            // NVIDIA or other format variations
            elseif (isset($data['response'])) {
                $message = $data['response'];
            }
            elseif (isset($data['text'])) {
                $message = $data['text'];
            }
            else {
                Log::error('Invalid API response format - no recognized content field', [
                    'response_data' => $data
                ]);
                return response()->json([
                    'error' => 'Invalid response format from AI - no content found'
                ], 500);
            }

            if (empty($message)) {
                Log::error('Empty message in API response', [
                    'response_data' => $data
                ]);
                return response()->json([
                    'error' => 'Empty response from AI'
                ], 500);
            }

            Log::info('Returning AI message', [
                'message_length' => strlen($message)
            ]);

            return response()->json([
                'message' => $message
            ]);

        } catch (\Exception $e) {
            Log::error('Curator chat error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'An error occurred while processing your request',
                'debug' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function saveCuratorsTestArtwork(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validate([
                'artwork_data' => 'required|string',
                'subject' => 'required|string|max:100',
                'score' => 'required|integer|min:0|max:100',
                'user_id' => 'required|integer',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            // Get the Curator's Test game
            $game = Game::where('slug', 'curators-test')->first();
            if (!$game) {
                return response()->json(['error' => 'Game not found'], 404);
            }

            // Create a new GameItem to store the artwork
            $gameItem = GameItem::create([
                'game_id' => $game->id,
                'value' => [
                    'type' => 'user_artwork',
                    'user_id' => $validated['user_id'],
                    'user_name' => auth()->user()->name,
                    'subject' => $validated['subject'],
                    'artwork_data' => $validated['artwork_data'],
                    'score' => $validated['score'],
                    'created_at' => now()->toISOString(),
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Artwork saved successfully',
                'artwork_id' => $gameItem->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to save Curator\'s Test artwork', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'subject' => $validated['subject'] ?? null,
            ]);

            return response()->json(['error' => 'Failed to save artwork'], 500);
        }
    }

    public function getCuratorsTestArtworks(Request $request)
    {
        try {
            $subject = $request->query('subject');
            if (!$subject) {
                return response()->json(['error' => 'Subject parameter required'], 400);
            }

            // Get the Curator's Test game
            $game = Game::where('slug', 'curators-test')->first();
            if (!$game) {
                return response()->json(['error' => 'Game not found'], 404);
            }

            // Get all artworks for this subject
            $artworks = GameItem::where('game_id', $game->id)
                ->where('value->type', 'user_artwork')
                ->where('value->subject', $subject)
                ->orderBy('value->score', 'desc')
                ->get()
                ->map(function ($item) {
                    $value = $item->value;
                    return [
                        'id' => $item->id,
                        'user_id' => $value['user_id'],
                        'user_name' => $value['user_name'] ?? 'Anonymous',
                        'subject' => $value['subject'],
                        'artwork_data' => $value['artwork_data'],
                        'score' => $value['score'],
                        'created_at' => $value['created_at'],
                    ];
                });

            return response()->json($artworks);

        } catch (\Exception $e) {
            Log::error('Failed to get Curator\'s Test artworks', [
                'error' => $e->getMessage(),
                'subject' => $request->query('subject'),
            ]);

            return response()->json(['error' => 'Failed to load artworks'], 500);
        }
    }

    public function curatorsTestGallery(Request $request)
    {
        // Get the Curator's Test game
        $game = Game::where('slug', 'curators-test')->first();
        if (!$game) {
            abort(404, 'Game not found');
        }

        // Get all saved artworks, grouped by subject
        $artworks = GameItem::where('game_id', $game->id)
            ->where('value->type', 'user_artwork')
            ->orderBy('value->score', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('value.subject')
            ->map(function ($subjectArtworks) {
                return $subjectArtworks->map(function ($item) {
                    $value = $item->value;
                    return [
                        'id' => $item->id,
                        'user_id' => $value['user_id'],
                        'user_name' => $value['user_name'] ?? 'Anonymous',
                        'subject' => $value['subject'],
                        'artwork_data' => $value['artwork_data'],
                        'score' => $value['score'],
                        'created_at' => $value['created_at'],
                    ];
                });
            });

        return Inertia::render('Games/CuratorsTestGallery', [
            'artworks' => $artworks,
            'game' => $game,
        ]);
    }

}
