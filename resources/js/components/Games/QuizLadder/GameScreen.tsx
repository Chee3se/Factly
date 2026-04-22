import React from "react";
import App from "@/layouts/App";
import { Button } from "@/components/ui/button";
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Quiz Ladder</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground tabular-nums">
                  {gameState.currentQuestion + 1}/{gameState.questions.length}
                </span>
                {gameState.phase === "question" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-bold text-sm tabular-nums">
                      {gameState.timeLeft}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 mb-5">
              <div className="flex justify-center gap-6 overflow-x-auto pb-1">
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
              <div className="text-center mt-2 text-xs text-muted-foreground">
                First to {winningCubes} points wins.
              </div>
            </div>

            <QuestionArea
              gameState={gameState}
              onSelectAnswer={onSelectAnswer}
              getPlayersWhoSelectedAnswer={getPlayersWhoSelectedAnswer}
            />
          </div>
        </div>

        <div className="space-y-3 flex flex-col">
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="w-4 h-4" />
                <span>Players</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {currentLobby?.players?.length || 0}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
              <LobbyPlayers
                auth={auth}
                lobbyHook={lobbyHook}
                showReadyToggle={false}
                isDarkTheme={false}
                isCompact={true}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <LobbyChat
                auth={auth}
                lobbyHook={lobbyHook}
                isDarkTheme={false}
                isCompact={true}
              />
            </div>
          </div>

          <Button
            onClick={onLeaveLobby}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          >
            Leave Game
          </Button>
        </div>
      </div>
    </App>
  );
};
