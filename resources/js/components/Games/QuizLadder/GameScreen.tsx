import React from "react";
import App from "@/layouts/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MessageSquare, Trophy } from "lucide-react";
import { StickFigure } from "./StickFigure";
import { QuestionArea } from "./QuestionArea";
import LobbyPlayers from "@/components/Lobby/LobbyPlayers";
import LobbyChat from "@/components/Lobby/LobbyChat";
import { GameState } from "@/types/quizladder";
import { useLobby } from "@/hooks/useLobby";

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
  winningCubes,
}) => {
  const getPlayersWhoSelectedAnswer = (answerIndex: number) => {
    const selections = gameState.playerSelections.filter(
      (selection) => selection.answerIndex === answerIndex,
    );

    if (gameState.selectedAnswer === answerIndex && auth.user) {
      selections.push({
        userId: auth.user.id,
        answerIndex: answerIndex,
        userName: auth.user.name,
      });
    }

    return selections
      .map((selection) =>
        currentLobby?.players?.find((p) => p.id === selection.userId),
      )
      .filter(Boolean);
  };

  const sortedPlayerStates = Object.values(gameState.playerStates)
    .map((state) => ({
      ...state,
      player: currentLobby.players?.find((p) => p.id === state.userId),
    }))
    .sort((a, b) => b.cubes - a.cubes);

  return (
    <App title="Quiz Ladder" auth={auth}>
      <div className="min-h-[80vh] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
        <div className="container mx-auto py-4 px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[70vh]">
            <div className="lg:col-span-3">
              <Card className="h-full backdrop-blur-sm bg-white/80 border-gray-300 text-gray-900 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-6 h-6 text-blue-600" />
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        Quiz Ladder
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className="bg-gray-200 text-gray-800 border-gray-400 px-2 py-1 text-sm"
                      >
                        {gameState.currentQuestion + 1}/
                        {gameState.questions.length}
                      </Badge>
                      {gameState.phase === "question" && (
                        <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-sm text-blue-800">
                            {gameState.timeLeft}s
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <Card className="bg-gray-50/80 backdrop-blur-sm border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex justify-center space-x-6 overflow-x-auto pb-2">
                        {sortedPlayerStates
                          .slice(0, 6)
                          .map((playerState, index) => (
                            <StickFigure
                              key={playerState.userId}
                              player={playerState.player}
                              playerState={playerState}
                              isCurrentUser={
                                playerState.userId === auth.user?.id
                              }
                              winningCubes={winningCubes}
                            />
                          ))}
                      </div>
                      <div className="text-center mt-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-800 border-blue-400 px-3 py-1 text-sm"
                        >
                          🏆 First to {winningCubes} points wins!
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <QuestionArea
                    gameState={gameState}
                    onSelectAnswer={onSelectAnswer}
                    getPlayersWhoSelectedAnswer={getPlayersWhoSelectedAnswer}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3 min-h-[70vh] flex flex-col">
              <Card className="backdrop-blur-sm bg-white/80 border-gray-300 text-gray-900 flex-1 overflow-hidden shadow-xl">
                <CardHeader className="pb-2 border-b border-gray-300">
                  <CardTitle className="text-base text-gray-900 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Players</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-gray-200 text-gray-800 border-gray-400 text-xs"
                    >
                      {currentLobby?.players?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden py-2">
                  <div className="h-full overflow-y-auto pr-2">
                    <LobbyPlayers
                      auth={auth}
                      lobbyHook={lobbyHook}
                      showReadyToggle={false}
                      isDarkTheme={false}
                      isCompact={true}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/80 border-gray-300 text-gray-900 flex-1 flex flex-col overflow-hidden shadow-xl">
                <CardHeader className="pb-2 border-b border-gray-300 flex-shrink-0">
                  <CardTitle className="text-base text-gray-900 flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col py-2 overflow-hidden">
                  <LobbyChat
                    auth={auth}
                    lobbyHook={lobbyHook}
                    isDarkTheme={false}
                    isCompact={true}
                  />
                </CardContent>
              </Card>

              <Button
                onClick={onLeaveLobby}
                variant="outline"
                size="sm"
                className="bg-gray-100 border-gray-400 text-gray-800 hover:bg-gray-200 hover:border-gray-500 backdrop-blur-sm flex-shrink-0 font-medium"
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
