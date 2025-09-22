import React from 'react';
import App from "@/layouts/App";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { StickFigure } from './StickFigure';
import { QuestionArea } from './QuestionArea';
import LobbyPlayers from '@/components/LobbyPlayers';
import LobbyChat from '@/components/LobbyChat';
import {GameState} from "@/types/quizladder";
import {useLobby} from "@/hooks/useLobby";

interface GameScreenProps {
    auth: Auth;
    currentLobby: any;
    gameState: GameState;
    messages: any[];
    lobbyHook: ReturnType<typeof useLobby>;
    onSelectAnswer: (answerIndex: number) => void;
    onLeaveLobby: () => void;
    winningCubes: number;
}

export const GameScreen: React.FC<GameScreenProps> = ({
                                                          auth,
                                                          currentLobby,
                                                          gameState,
                                                          messages,
                                                          lobbyHook,
                                                          onSelectAnswer,
                                                          onLeaveLobby,
                                                          winningCubes
                                                      }) => {

    const getPlayersWhoSelectedAnswer = (answerIndex: number) => {
        const selections = gameState.playerSelections.filter(selection => selection.answerIndex === answerIndex);

        // Add current user if they selected this answer
        if (gameState.selectedAnswer === answerIndex && auth.user) {
            selections.push({
                userId: auth.user.id,
                answerIndex: answerIndex,
                userName: auth.user.name
            });
        }

        return selections.map(selection =>
            currentLobby?.players?.find(p => p.id === selection.userId)
        ).filter(Boolean);
    };

    const sortedPlayerStates = Object.values(gameState.playerStates)
        .map(state => ({
            ...state,
            player: currentLobby.players?.find(p => p.id === state.userId)
        }))
        .sort((a, b) => b.cubes - a.cubes);

    return (
        <App title="Quiz Ladder" auth={auth}>
            <div className="min-h-[80vh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <div className="container mx-auto py-6 px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">

                        {/* Main Game Area */}
                        <div className="lg:col-span-3">
                            <Card className="h-full backdrop-blur-sm bg-black/30 border-white/20 text-white flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-black text-yellow-400 drop-shadow-lg">
                                            QUIZ LADDER
                                        </CardTitle>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/10">
                                                Question {gameState.currentQuestion + 1}/{gameState.questions.length}
                                            </Badge>
                                            {gameState.phase === 'question' && (
                                                <div className="flex items-center space-x-2 bg-red-500/80 px-3 py-1 rounded-full backdrop-blur-sm">
                                                    <Clock size={16} />
                                                    <span className="font-bold text-lg">{gameState.timeLeft}s</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col">
                                    {/* Player Ladder Visualization */}
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                                        <h4 className="text-lg font-bold text-yellow-400 mb-3 text-center drop-shadow-lg">
                                            LADDER STANDINGS
                                        </h4>
                                        <div className="flex justify-center space-x-6 overflow-x-auto pb-2">
                                            {sortedPlayerStates.slice(0, 6).map((playerState) => (
                                                <StickFigure
                                                    key={playerState.userId}
                                                    player={playerState.player}
                                                    playerState={playerState}
                                                    isCurrentUser={playerState.userId === auth.user?.id}
                                                    winningCubes={winningCubes}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-center mt-2 text-sm text-gray-300">
                                            First to {winningCubes} cubes wins!
                                        </div>
                                    </div>

                                    {/* Question Area */}
                                    <QuestionArea
                                        gameState={gameState}
                                        onSelectAnswer={onSelectAnswer}
                                        getPlayersWhoSelectedAnswer={getPlayersWhoSelectedAnswer}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4 h-[80vh] flex flex-col">
                            {/* Players List */}
                            <Card className="backdrop-blur-sm bg-black/30 border-white/20 text-white flex-1 overflow-hidden">
                                <CardHeader className="pb-3 border-b border-white/10">
                                    <CardTitle className="text-lg text-white flex items-center justify-between">
                                        Players
                                        <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                                            {currentLobby?.players?.length || 0}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden py-4">
                                    <div className="h-full overflow-y-auto pr-2">
                                        <LobbyPlayers
                                            auth={auth}
                                            lobbyHook={lobbyHook}
                                            showReadyToggle={false}
                                            isDarkTheme={true}
                                            isCompact={true}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Chat */}
                            <Card className="backdrop-blur-sm bg-black/30 border-white/20 text-white flex-1 flex flex-col overflow-hidden">
                                <CardHeader className="pb-3 border-b border-white/10 flex-shrink-0">
                                    <CardTitle className="text-lg text-white">Chat</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col py-4 overflow-hidden">
                                    <LobbyChat
                                        auth={auth}
                                        lobbyHook={lobbyHook}
                                        isDarkTheme={true}
                                        isCompact={true}
                                    />
                                </CardContent>
                            </Card>

                            {/* Leave Game */}
                            <Button
                                onClick={onLeaveLobby}
                                variant="outline"
                                className="bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30 hover:border-red-400/70 backdrop-blur-sm flex-shrink-0"
                            >
                                Leave Game
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </App>
    );
};
