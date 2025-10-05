import React from "react";
import App from "@/layouts/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";
  };

  const getAvatarUrl = (avatar?: string): string | null => {
    if (!avatar) return null;
    return `/storage/${avatar}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-600" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-500" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <Trophy className="w-6 h-6 text-blue-600" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2:
        return "bg-gray-100 text-gray-700 border-gray-300";
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <App title="Quiz Ladder - Game Over" auth={auth}>
      <div className="min-h-[80vh] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-4">
        <Card className="text-gray-900 bg-white/90 backdrop-blur-sm border-gray-300 max-w-2xl w-full shadow-xl">
          <CardHeader className="text-center pb-4 border-b border-gray-300">
            <div className="flex justify-center mb-3">
              <Trophy className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-4xl font-bold mb-3 text-gray-800">
              {isWinner ? "VICTORY!" : "GAME OVER"}
            </CardTitle>
            <div className="space-y-2">
              <p className="text-lg text-gray-600">🏆 Winner</p>
              <div className="flex items-center justify-center space-x-3">
                <Avatar className="w-12 h-12 shadow-lg border-2 border-gray-400">
                  <AvatarImage
                    src={getAvatarUrl(winner?.player?.avatar) || undefined}
                    alt={winner?.player?.name}
                  />
                  <AvatarFallback className="text-lg font-bold bg-gray-200 text-gray-700">
                    {getInitials(winner?.player?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-bold text-gray-800">
                    {winner?.player?.name}
                  </p>
                  <p className="text-base text-gray-600">
                    {winner?.cubes} points
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-center mb-3 text-gray-600">
                🏅 Final Rankings
              </h3>
              <div className="space-y-2">
                {sortedPlayers.map((playerState, index) => (
                  <div
                    key={playerState.userId}
                    className={`flex items-center justify-between p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                      playerState.userId === auth.user?.id
                        ? "bg-blue-50 border border-blue-300 shadow-lg"
                        : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`${getRankBadgeColor(index + 1)} font-bold px-2 py-1 border text-sm`}
                      >
                        #{index + 1}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getRankIcon(index + 1)}
                      </div>
                      <Avatar className="w-10 h-10 shadow-md border-2 border-gray-400">
                        <AvatarImage
                          src={
                            getAvatarUrl(playerState.player?.avatar) ||
                            undefined
                          }
                          alt={playerState.player?.name}
                        />
                        <AvatarFallback className="text-sm font-bold bg-gray-200 text-gray-700">
                          {getInitials(playerState.player?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-base text-gray-800">
                        {playerState.player?.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-base text-gray-700">
                        {playerState.cubes}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-3">
              <Button
                onClick={onLeaveLobby}
                size="default"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 shadow-lg transform hover:scale-105 transition-all duration-300 font-bold text-base text-white"
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
