import React from "react";
import App from "@/layouts/App";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { GameState } from "@/types/quizladder";

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
  onLeaveLobby,
}) => {
  const sortedPlayers = Object.values(gameState.playerStates)
    .map((state) => ({
      ...state,
      player: currentLobby.players?.find((p) => p.id === state.userId),
    }))
    .sort((a, b) => b.cubes - a.cubes);

  const winner = sortedPlayers[0];
  const isWinner = winner?.userId === auth.user?.id;

  const getInitials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  const getAvatarUrl = (avatar?: string): string | null =>
    avatar ? `/storage/${avatar}` : null;

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-400" />;
    if (rank === 3) return <Award className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <App title="Quiz Ladder - Game Over" auth={auth}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur overflow-hidden">
          <div className="p-8 text-center border-b border-border/40">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">
              {isWinner ? "Victory" : "Game Over"}
            </h1>

            <div className="inline-flex items-center gap-4 px-5 py-4 rounded-2xl border border-border/60 bg-background">
              <Avatar
                className="w-14 h-14"
                decoration={winner?.player?.decoration}
              >
                <AvatarImage
                  src={getAvatarUrl(winner?.player?.avatar) || undefined}
                  alt={winner?.player?.name}
                />
                <AvatarFallback className="text-base font-bold bg-primary text-primary-foreground">
                  {getInitials(winner?.player?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Winner
                </div>
                <div className="text-lg font-bold">{winner?.player?.name}</div>
                <div className="text-sm text-muted-foreground tabular-nums">
                  {winner?.cubes} points
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
              Final Rankings
            </h3>
            <ul className="space-y-1">
              {sortedPlayers.map((playerState, index) => {
                const rank = index + 1;
                const isCurrentUser = playerState.userId === auth.user?.id;
                return (
                  <li
                    key={playerState.userId}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                      isCurrentUser ? "bg-primary/5" : "bg-muted/30"
                    }`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {rank <= 3 ? (
                        rankIcon(rank)
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                          {rank}
                        </span>
                      )}
                    </div>
                    <Avatar
                      className="w-10 h-10"
                      decoration={playerState.player?.decoration}
                    >
                      <AvatarImage
                        src={
                          getAvatarUrl(playerState.player?.avatar) || undefined
                        }
                        alt={playerState.player?.name}
                      />
                      <AvatarFallback className="text-sm font-bold bg-muted text-foreground">
                        {getInitials(playerState.player?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="font-medium truncate">
                        {playerState.player?.name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold tabular-nums">
                        {playerState.cubes}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="text-center pt-6">
              <Button onClick={onLeaveLobby} size="lg" className="px-8">
                Return to Lobbies
              </Button>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};
