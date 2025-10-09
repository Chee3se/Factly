import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerGameState } from "@/types/quizladder";

interface StickFigureProps {
  player: any;
  playerState: PlayerGameState;
  isCurrentUser: boolean;
  winningCubes: number;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  player,
  playerState,
  isCurrentUser,
  winningCubes,
}) => {
  const progressPercentage = Math.min(
    100,
    (playerState.cubes / winningCubes) * 100,
  );
  const ladderHeight = 140;
  const numberOfRungs = 10;
  const avatarPosition = (progressPercentage / 100) * ladderHeight;

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getAvatarUrl = (avatar?: string): string | null => {
    if (!avatar) return null;
    return `/storage/${avatar}`;
  };

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={`mb-1 px-2 py-1 rounded text-xs ${
          isCurrentUser
            ? "bg-blue-100 border border-blue-300"
            : "bg-gray-100 border border-gray-300"
        }`}
      >
        <span
          className={`font-semibold ${
            isCurrentUser ? "text-blue-800" : "text-gray-600"
          }`}
        >
          {player?.name || "Unknown"}
        </span>
      </div>

      <div
        className="relative"
        style={{ height: `${ladderHeight + 80}px`, width: "80px" }}
      >
        <div
          className="absolute left-1/2 transform -translate-x-1/2 flex justify-between"
          style={{ width: "40px", height: `${ladderHeight}px` }}
        >
          <div className="w-1 h-full bg-gray-600"></div>
          <div className="w-1 h-full bg-gray-600"></div>

          {Array.from({ length: numberOfRungs }).map((_, index) => {
            const rungPosition =
              (index / (numberOfRungs - 1)) * (ladderHeight - 4);
            return (
              <div
                key={index}
                className="absolute left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-600"
                style={{ top: `${rungPosition}px` }}
              />
            );
          })}
        </div>

        <div
          className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-500 ease-out"
          style={{
            bottom: `${avatarPosition}px`,
            width: "42px",
            height: "42px",
          }}
        >
          <div
            className={`w-10 h-10 rounded-full ${
              isCurrentUser
                ? "ring-2 ring-blue-400 shadow-lg"
                : "ring-1 ring-gray-400"
            }`}
          >
            <Avatar className="w-full h-full" decoration={player?.decoration}>
              <AvatarImage
                src={getAvatarUrl(player?.avatar) || undefined}
                alt={player?.name || "Player"}
                className="object-cover object-center"
              />
              <AvatarFallback className="text-sm font-bold bg-gray-200 text-gray-700">
                {getInitials(player?.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div
        className={`mt-1 px-2 py-1 rounded border text-xs ${
          isCurrentUser
            ? "bg-blue-50 border-blue-300"
            : "bg-gray-50 border-gray-300"
        }`}
      >
        <div className="text-center">
          <div
            className={`font-bold ${
              isCurrentUser ? "text-blue-800" : "text-gray-600"
            }`}
          >
            {playerState.cubes}/{winningCubes}
          </div>
          <div className="text-xs text-gray-500">
            {progressPercentage.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
