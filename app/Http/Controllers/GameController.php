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
    /**
     * Store a new game suggestion from a user.
     */
    public function storeSuggestion(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100|min:3',
            'description' => 'required|string|max:500|min:10'
        ]);

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

    /**
     * Render the home page (or the landing page for guests) with the list of games.
     */
    public function index()
    {
        if (!auth()->check()) {
            return Inertia::render('Landing', [
                'games' => Game::select('id', 'name', 'slug', 'description', 'thumbnail', 'min_players', 'max_players')->get(),
            ]);
        }

        $games = Game::all();
        return Inertia::render('Home', [
            'games' => $games,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }



    /**
     * Dispatch to the right game method based on the game's slug.
     */
    public function show(Game $game)
    {
        $methodName = str_replace('-', '_', $game->slug);

        if (method_exists($this, $methodName)) {
            return $this->$methodName($game);
        }

        return redirect('/');
    }

    /**
     * Render the Higher or Lower game page with shuffled items.
     */
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

        $bestScore = Score::where('user_id', auth()->id())
            ->where('game_id', $game->id)
            ->max('score') ?? 0;

        return Inertia::render('Games/HigherOrLower', [
            'items' => $items,
            'bestScore' => $bestScore,
            'gameSlug' => $game->slug
        ]);
    }

    /**
     * Render the Quiz Ladder game page with a random set of questions.
     */
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

        $bestScore = Score::where('user_id', auth()->id())
            ->where('game_id', $game->id)
            ->max('score') ?? 0;

        // Check if user is coming from a lobby (via URL parameter)
        $lobbyCode = request()->get('lobby');
        $lobby = null;

        if ($lobbyCode) {
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

    /**
     * Render the Impact Auction game page with shuffled auction items.
     */
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

        $bestScore = Score::where('user_id', auth()->id())
            ->where('game_id', $game->id)
            ->max('score') ?? 0;

        // Check if user is coming from a lobby
        $lobbyCode = request()->get('lobby');
        $lobby = null;

        if ($lobbyCode) {
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

    /**
     * Render the Factually game page with its statement pool.
     */
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

        $bestScore = Score::where('user_id', auth()->id())
            ->where('game_id', $game->id)
            ->max('score') ?? 0;

        return Inertia::render('Games/Factually', [
            'items' => $items,
            'bestScore' => $bestScore,
            'gameSlug' => $game->slug
        ]);
    }

    /**
     * Render the Curator's Test game page with a random word to draw.
     */
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

        $bestScore = Score::where('user_id', auth()->id())
            ->where('game_id', $game->id)
            ->max('score') ?? 0;

        return Inertia::render('Games/CuratorsTest', [
            'word' => $word,
            'bestScore' => $bestScore,
            'gameSlug' => $game->slug
        ]);
    }

    /**
     * Handle a chat turn with the AI curator. Routes the drawing through a vision model when provided.
     */
    public function curatorsTestChat(Request $request)
    {
        $validated = $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string|in:user,assistant,system',
            'messages.*.content' => 'required|string',
            'artwork_subject' => 'required|string',
            'artwork_data' => 'nullable|string',
            'mode' => 'nullable|string|in:defend,mystery,critic',
        ]);

        try {
            $openAiUrl = config('services.openai.url');
            if (!str_ends_with($openAiUrl, '/chat/completions')) {
                $openAiUrl = rtrim($openAiUrl, '/') . '/chat/completions';
            }
            $openAiKey = config('services.openai.key');
            $useVision = !empty($validated['artwork_data']);
            $modelId = $useVision
                ? config('services.openai.vision_model')
                : config('services.openai.model');

            if (!$openAiKey) {
                Log::error('OpenAI API key not configured');
                return response()->json(['error' => 'OpenAI API key not configured'], 500);
            }

            $messages = $this->prepareCuratorMessages(
                $validated['messages'],
                $validated['artwork_data'] ?? null
            );

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . $openAiKey,
                'Content-Type' => 'application/json',
            ])->timeout(45)->post($openAiUrl, [
                'model' => $modelId,
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 500,
            ]);

            if (!$response->successful()) {
                Log::error('OpenAI API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'model' => $modelId,
                    'vision' => $useVision,
                ]);
                return response()->json(['error' => 'Failed to get response from AI'], 500);
            }

            $data = $response->json();

            $message = $data['choices'][0]['message']['content']
                ?? $data['content']
                ?? $data['message']
                ?? $data['response']
                ?? $data['text']
                ?? null;

            if (empty($message)) {
                Log::error('Invalid or empty API response');
                return response()->json(['error' => 'Empty response from AI'], 500);
            }

            return response()->json(['message' => $message]);

        } catch (\Exception $e) {
            Log::error('Curator chat error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred while processing your request'], 500);
        }
    }

    /**
     * Inject the artwork image into the first user message so the vision model sees it.
     */
    private function prepareCuratorMessages(array $messages, ?string $artworkData): array
    {
        if (!$artworkData) {
            return $messages;
        }

        $injected = false;
        $prepared = [];

        foreach ($messages as $msg) {
            if (!$injected && $msg['role'] === 'user') {
                $prepared[] = [
                    'role' => 'user',
                    'content' => [
                        ['type' => 'text', 'text' => $msg['content']],
                        ['type' => 'image_url', 'image_url' => ['url' => $artworkData]],
                    ],
                ];
                $injected = true;
                continue;
            }
            $prepared[] = $msg;
        }

        if (!$injected) {
            $prepared[] = [
                'role' => 'user',
                'content' => [
                    ['type' => 'text', 'text' => 'Here is the artwork I submitted.'],
                    ['type' => 'image_url', 'image_url' => ['url' => $artworkData]],
                ],
            ];
        }

        return $prepared;
    }

    /**
     * Save a user's Curator's Test drawing to the gallery.
     */
    public function saveCuratorsTestArtwork(Request $request)
    {
        $validated = $request->validate([
            'artwork_data' => 'required|string',
            'subject' => 'required|string|max:100',
            'score' => 'required|integer|min:0|max:100',
        ]);

        try {
            // Get the Curator's Test game
            $game = Game::where('slug', 'curators-test')->first();
            if (!$game) {
                return response()->json(['error' => 'Game not found'], 404);
            }

            // Create a new GameItem to store the artwork. Never trust client-supplied user_id.
            $gameItem = GameItem::create([
                'game_id' => $game->id,
                'value' => [
                    'type' => 'user_artwork',
                    'user_id' => auth()->id(),
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

    /**
     * Return saved Curator's Test artworks, optionally filtered by subject word.
     */
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

    /**
     * Render the public gallery of saved Curator's Test artworks.
     */
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
