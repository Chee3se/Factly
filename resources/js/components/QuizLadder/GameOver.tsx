import React from 'react';
import App from "@/layouts/App";
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
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

    return (
        <App title="Quiz Ladder - Game Over" auth={auth}>
            <div className="min-h-[80vh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white p-8 bg-black/50 rounded-2xl backdrop-blur-sm border border-white/20 max-w-md mx-auto">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-black mb-4 text-yellow-400 drop-shadow-lg">
                        {isWinner ? 'YOU WIN!' : 'GAME OVER!'}
                    </h1>
                    <p className="text-lg mb-2">Winner: {winner?.player?.name}</p>
                    <p className="text-2xl font-bold text-yellow-400 mb-6">{winner?.cubes} cubes</p>

                    <div className="space-y-2 mb-6">
                        <h3 className="font-bold">Final Rankings:</h3>
                        {sortedPlayers.slice(0, 3).map((playerState, index) => (
                            <div key={playerState.userId} className="flex justify-between text-sm">
                                <span>#{index + 1} {playerState.player?.name}</span>
                                <span>{playerState.cubes} cubes</span>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={onLeaveLobby}
                        size="lg"
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-lg"
                    >
                        Return to Lobbies
                    </Button>
                </div>
            </div>
        </App>
    );
};
