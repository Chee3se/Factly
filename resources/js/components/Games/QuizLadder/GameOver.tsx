import React from 'react';
import App from "@/layouts/App";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import {GameState} from "@/types/quizladder";

interface GameOverScreenProps {
    auth: Auth;
    currentLobby: any;
    gameState: GameState;
    onLeaveLobby: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
                                                                  auth,
                                                                  currentLobby,
                                                                  gameState,
                                                                  onLeaveLobby
                                                              }) => {
    const sortedPlayers = Object.values(gameState.playerStates)
        .map(state => ({
            ...state,
            player: currentLobby.players?.find(p => p.id === state.userId)
        }))
        .sort((a, b) => b.cubes - a.cubes);

    const winner = sortedPlayers[0];
    const isWinner = winner?.userId === auth.user?.id;

    // Get first letter of name for fallback
    const getInitials = (name: string) => {
        return name
            ? name.split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : '?';
    };

    // Get avatar URL similar to profile page
    const getAvatarUrl = (avatar?: string): string | null => {
        if (!avatar) return null;
        return `/storage/${avatar}`;
    };

    const getRankIcon = (rank: number) => {
        switch(rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Award className="w-6 h-6 text-amber-600" />;
            default: return <Trophy className="w-6 h-6 text-blue-400" />;
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch(rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-yellow-300';
            case 2: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300';
            case 3: return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-300';
            default: return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300';
        }
    };

    return (
        <App title="Quiz Ladder - Game Over" auth={auth}>
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <Card className="text-white bg-black/30 backdrop-blur-sm border-white/20 max-w-2xl w-full shadow-2xl">
                    <CardHeader className="text-center pb-6 border-b border-white/10">
                        <div className="flex justify-center mb-4">
                            <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-lg" />
                        </div>
                        <CardTitle className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
                            {isWinner ? 'VICTORY!' : 'GAME OVER'}
                        </CardTitle>
                        <div className="space-y-2">
                            <p className="text-xl text-gray-200">🏆 Winner</p>
                            <div className="flex items-center justify-center space-x-3">
                                <Avatar className="w-16 h-16 shadow-lg">
                                    <AvatarImage
                                        src={getAvatarUrl(winner?.player?.avatar) || undefined}
                                        alt={winner?.player?.name}
                                    />
                                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-yellow-400 to-orange-500 text-black">
                                        {getInitials(winner?.player?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-2xl font-bold text-yellow-400">{winner?.player?.name}</p>
                                    <p className="text-lg text-gray-300">{winner?.cubes} cubes</p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        {/* Final Rankings */}
                        <div>
                            <h3 className="text-xl font-bold text-center mb-4 text-yellow-400">🏅 Final Rankings</h3>
                            <div className="space-y-3">
                                {sortedPlayers.map((playerState, index) => (
                                    <div
                                        key={playerState.userId}
                                        className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                                            playerState.userId === auth.user?.id
                                                ? 'bg-yellow-400/20 border border-yellow-400/30 shadow-lg'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Badge className={`${getRankBadgeColor(index + 1)} font-bold px-3 py-1 shadow-lg`}>
                                                #{index + 1}
                                            </Badge>
                                            <div className="flex items-center space-x-1">
                                                {getRankIcon(index + 1)}
                                            </div>
                                            <Avatar className="w-12 h-12 shadow-md">
                                                <AvatarImage
                                                    src={getAvatarUrl(playerState.player?.avatar) || undefined}
                                                    alt={playerState.player?.name}
                                                />
                                                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    {getInitials(playerState.player?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-lg">{playerState.player?.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-yellow-400">{playerState.cubes}</div>
                                            <div className="text-xs text-gray-400">cubes</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center pt-4">
                            <Button
                                onClick={onLeaveLobby}
                                size="lg"
                                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-xl transform hover:scale-105 transition-all duration-300 font-bold text-lg"
                            >
                                Return to Lobbies
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </App>
    );
};
