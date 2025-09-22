import React, { useState } from 'react';
import App from "@/layouts/App";
import { Game } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, User, Gamepad, Lightbulb, Plus } from 'lucide-react';
import SuggestionModal from '@/components/SuggestionModal';
import { toast } from 'sonner';

interface Props {
    auth: Auth;
    games: Game[];
}

export default function Home({auth, games}: Props) {
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);

    const handleSuggestionClick = () => {
        if (!auth.user) {
            toast.error('Please log in to submit a suggestion');
            return;
        }
        setShowSuggestionModal(true);
    };

    return (
        <App title={"Home"} auth={auth}>
            <div className="container mx-auto px-4 py-8">
                {/* Header with suggestion button */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Games
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Choose a game to play or suggest a new one
                        </p>
                    </div>

                    <Button
                        onClick={handleSuggestionClick}
                        variant="outline"
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-yellow-200 text-yellow-700 hover:text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700/50 dark:text-yellow-400 dark:hover:text-yellow-300"
                    >
                        <Lightbulb className="h-4 w-4" />
                        Suggest a Game
                    </Button>
                </div>

                {(!games || games.length === 0) ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Users className="mx-auto h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No games available
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Be the first to suggest a game idea!
                        </p>
                        <Button
                            onClick={handleSuggestionClick}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Suggest the First Game
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {games.map((game) => (
                            <Card key={game.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={game.thumbnail}
                                        alt={game.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                                            {game.name}
                                        </CardTitle>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0 pb-2">
                                    <CardDescription className="text-sm line-clamp-2 mb-2">
                                        {game.description}
                                    </CardDescription>

                                    {(game.min_players > 0 || game.max_players > 0) && (
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                <span>
                                                    {game.min_players === game.max_players
                                                        ? `${game.min_players} player${game.min_players !== 1 ? 's' : ''}`
                                                        : `${game.min_players}-${game.max_players} players`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-0">
                                    <Button
                                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                        onClick={() => window.location.href = `/games/${game.slug}`}
                                    >
                                        Play Game
                                        <Gamepad className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Suggestion Modal */}
                <SuggestionModal
                    isOpen={showSuggestionModal}
                    onClose={() => setShowSuggestionModal(false)}
                    auth={auth}
                />
            </div>
        </App>
    );
}
