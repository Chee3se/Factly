import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerGameState } from "@/types/quizladder";

interface StickFigureProps {
  player: any;
  playerState: PlayerGameState;
  isCurrentUser: boolean;
  winningCubes: number;
}

const PALETTE = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-pink-700",
  "from-amber-500 to-amber-700",
  "from-emerald-500 to-emerald-700",
  "from-red-500 to-red-700",
  "from-cyan-500 to-cyan-700",
  "from-indigo-500 to-indigo-700",
];

const pickColor = (id?: number | string) => {
  if (id == null) return PALETTE[0];
  const n = typeof id === "number" ? id : id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
};

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
  const ladderHeight = 160;
  const numberOfRungs = 8;
  const avatarPosition = (progressPercentage / 100) * ladderHeight;

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

  const fallbackGradient = pickColor(player?.id ?? player?.name);

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={`mb-2 px-2.5 py-1 rounded-full text-xs font-semibold max-w-[80px] truncate ${
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
        title={player?.name || "Unknown"}
      >
        {player?.name || "Unknown"}
      </div>

      <div
        className="relative"
        style={{ height: `${ladderHeight + 60}px`, width: "72px" }}
      >
        {/* Ladder posts */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex justify-between"
          style={{ width: "40px", height: `${ladderHeight}px`, bottom: 0 }}
        >
          <div className="w-1 h-full rounded-full bg-gradient-to-b from-stone-400 to-stone-600" />
          <div className="w-1 h-full rounded-full bg-gradient-to-b from-stone-400 to-stone-600" />

          {Array.from({ length: numberOfRungs }).map((_, index) => {
            const rungPosition =
              (index / (numberOfRungs - 1)) * (ladderHeight - 4);
            return (
              <div
                key={index}
                className="absolute left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-stone-500"
                style={{ bottom: `${rungPosition}px` }}
              />
            );
          })}
        </div>

        {/* Climbing avatar */}
        <div
          className="absolute left-1/2 z-10"
          style={{
            bottom: `${avatarPosition}px`,
            transform: "translateX(-50%)",
            transition: "bottom 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            width: "44px",
            height: "44px",
            willChange: "bottom",
          }}
        >
          <Avatar
            className={`w-11 h-11 ${
              isCurrentUser
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg"
                : !player?.avatar
                  ? "ring-1 ring-border/80 shadow-md"
                  : "shadow-md"
            }`}
            margin="m-0"
            decoration={player?.decoration}
          >
            <AvatarImage
              src={getAvatarUrl(player?.avatar) || undefined}
              alt={player?.name || "Player"}
              className="object-cover object-center"
            />
            <AvatarFallback
              className={`text-base font-bold text-white bg-gradient-to-br ${fallbackGradient} shadow-inner`}
            >
              {getInitials(player?.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div
        className={`mt-1 px-2.5 py-1 rounded-full text-xs text-center tabular-nums ${
          isCurrentUser
            ? "bg-primary/10 text-primary font-bold"
            : "bg-muted text-muted-foreground font-semibold"
        }`}
      >
        {playerState.cubes}/{winningCubes}
      </div>
    </div>
  );
};
