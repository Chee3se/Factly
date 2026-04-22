import React, { useEffect, useState } from "react";
import { AuctionGameState } from "@/types/impactauction";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Lobby } from "@/types/lobby";
import { useLobby } from "@/hooks/useLobby";
import { cn } from "@/lib/utils";
import { Crown, Medal, Award, Trophy, Zap } from "lucide-react";

const getAvatarUrl = (avatar?: string): string | undefined =>
  avatar ? `/storage/${avatar}` : undefined;

const CATEGORY_COLORS: { [key: string]: string } = {
  "renewable-energy": "from-emerald-500 to-green-600",
  "social-media": "from-blue-500 to-indigo-600",
  healthcare: "from-rose-500 to-pink-600",
  "space-travel": "from-purple-500 to-violet-600",
  education: "from-amber-500 to-orange-600",
  transportation: "from-cyan-500 to-teal-600",
  agriculture: "from-lime-500 to-green-600",
  communication: "from-sky-500 to-blue-600",
  technology: "from-fuchsia-500 to-purple-600",
};

interface Props {
  gameState: AuctionGameState;
  onLeaveLobby: () => void;
  currentLobby: Lobby | null;
  players: any[];
  lobbyHook: ReturnType<typeof useLobby>;
  auth: Auth;
}

interface PlayerScore {
  userId: number;
  userName: string;
  totalImpact: number;
  positiveImpact: number;
  negativeImpact: number;
  itemsWon: number;
  totalSpent: number;
}

const impactColor = (impact: number) => {
  if (impact >= 50) return "text-emerald-500";
  if (impact >= 20) return "text-lime-500";
  if (impact >= 0) return "text-amber-500";
  if (impact >= -20) return "text-orange-500";
  return "text-red-500";
};

const rankIcon = (rank: number) => {
  if (rank === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 1) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 2) return <Award className="w-5 h-5 text-amber-600" />;
  return null;
};

export function ResultsScreen({
  gameState,
  onLeaveLobby,
  currentLobby,
  players,
  auth,
}: Props) {
  const [revealedItems, setRevealedItems] = useState<number[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);

  useEffect(() => {
    if (currentRevealIndex < gameState.itemWinners.length) {
      const timer = setTimeout(() => {
        setRevealedItems((prev) => [...prev, currentRevealIndex]);
        setCurrentRevealIndex((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (
      currentRevealIndex === gameState.itemWinners.length &&
      !showLeaderboard
    ) {
      const timer = setTimeout(() => setShowLeaderboard(true), 800);
      return () => clearTimeout(timer);
    }
  }, [currentRevealIndex, gameState.itemWinners.length, showLeaderboard]);

  const playerScores: PlayerScore[] = Object.values(gameState.playerStates)
    .map((playerState) => {
      const player = currentLobby?.players?.find(
        (p) => p.id === playerState.userId,
      );
      const base: PlayerScore = {
        userId: playerState.userId,
        userName: player?.name || `Player ${playerState.userId}`,
        totalImpact: 0,
        positiveImpact: 0,
        negativeImpact: 0,
        itemsWon: 0,
        totalSpent: 0,
      };
      gameState.itemWinners.forEach((winner) => {
        if (winner.winnerId !== playerState.userId || winner.winningBid <= 0)
          return;
        const item = gameState.items.find((i) => i.id === winner.itemId);
        if (!item) return;
        base.totalImpact += item.net_impact;
        base.positiveImpact += item.positive_impact;
        base.negativeImpact += item.negative_impact;
        base.itemsWon += 1;
        base.totalSpent += winner.winningBid;
      });
      return base;
    })
    .sort((a, b) => b.totalImpact - a.totalImpact);

  const winner = playerScores[0];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          Impact Revealed
        </h1>
        <p className="text-muted-foreground">
          Let's see how your choices impacted the world.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {gameState.itemWinners.map((itemWinner, index) => {
          const item = gameState.items.find((i) => i.id === itemWinner.itemId);
          const isRevealed = revealedItems.includes(index);
          if (!item) return null;

          const player = currentLobby?.players?.find(
            (p) => p.id === itemWinner.winnerId,
          );
          const playerName =
            player?.name || `Player ${itemWinner.winnerId}`;
          const nobodyWon = itemWinner.winningBid === 0;
          const categoryGradient =
            CATEGORY_COLORS[item.category] || "from-slate-500 to-slate-600";
          const categoryLabel = item.category
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          return (
            <div
              key={itemWinner.itemId}
              className={cn(
                "rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-5 transition-all duration-500",
                isRevealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
              )}
            >
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-white font-semibold text-[10px] uppercase tracking-wider mb-2 bg-gradient-to-r",
                      categoryGradient,
                    )}
                  >
                    {categoryLabel}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.description}
                  </p>

                  {nobodyWon ? (
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground px-3 py-1 rounded-full bg-muted/50">
                      No bids placed
                    </span>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-background">
                      <Avatar
                        className="w-6 h-6"
                        decoration={
                          players.find((p) => p.id === itemWinner.winnerId)
                            ?.decoration
                        }
                      >
                        <AvatarImage
                          src={getAvatarUrl(
                            players.find((p) => p.id === itemWinner.winnerId)
                              ?.avatar,
                          )}
                          alt={playerName}
                        />
                        <AvatarFallback className="text-xs bg-muted">
                          {playerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm">{playerName}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {itemWinner.winningBid} pts
                      </span>
                    </div>
                  )}
                </div>

                <div className="md:w-72 shrink-0 rounded-xl bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Real-World Impact
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <ImpactBar
                      label="Positive"
                      value={item.positive_impact}
                      color="bg-emerald-500"
                      textColor="text-emerald-500"
                      prefix="+"
                    />
                    <ImpactBar
                      label="Negative"
                      value={item.negative_impact}
                      color="bg-red-500"
                      textColor="text-red-500"
                      prefix="-"
                    />
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Net
                      </span>
                      <span
                        className={cn(
                          "text-xl font-bold tabular-nums",
                          impactColor(item.net_impact),
                        )}
                      >
                        {item.net_impact > 0 ? "+" : ""}
                        {item.net_impact}
                      </span>
                    </div>
                  </div>

                  {item.impact_description && (
                    <p className="mt-3 text-xs text-muted-foreground italic leading-relaxed">
                      {item.impact_description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showLeaderboard && (
        <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-6 mb-6 animate-in fade-in duration-500">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Final Leaderboard
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Ranked by total impact
            </p>
          </div>

          <ul className="space-y-1">
            {playerScores.map((score, index) => {
              const isCurrentUser = score.userId === auth.user?.id;
              const player = players.find((p) => p.id === score.userId);

              return (
                <li
                  key={score.userId}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl",
                    isCurrentUser ? "bg-primary/5" : "bg-muted/30",
                  )}
                >
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {index < 3 ? (
                      rankIcon(index)
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <Avatar
                    className="w-10 h-10 shrink-0"
                    decoration={player?.decoration}
                  >
                    <AvatarImage
                      src={getAvatarUrl(player?.avatar)}
                      alt={score.userName}
                    />
                    <AvatarFallback className="text-sm bg-muted">
                      {score.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate flex items-center gap-2">
                      {score.userName}
                      {isCurrentUser && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                      <span>{score.itemsWon} won</span>
                      <span>·</span>
                      <span>{score.totalSpent} spent</span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-4 text-xs">
                    <div className="text-right tabular-nums">
                      <div className="font-semibold text-emerald-500">
                        +{score.positiveImpact}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Pos
                      </div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-semibold text-red-500">
                        -{score.negativeImpact}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Neg
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={cn(
                        "text-2xl font-bold tabular-nums",
                        impactColor(score.totalImpact),
                      )}
                    >
                      {score.totalImpact > 0 ? "+" : ""}
                      {score.totalImpact}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {winner && (
            <div className="mt-6 p-5 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 text-center">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold mb-1">
                {winner.userName} wins
              </h3>
              <p className="text-sm text-muted-foreground">
                Built the most impactful portfolio at{" "}
                <span
                  className={cn("font-bold", impactColor(winner.totalImpact))}
                >
                  {winner.totalImpact > 0 ? "+" : ""}
                  {winner.totalImpact}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <Button onClick={onLeaveLobby} size="lg" className="px-8">
          Return to Lobby
        </Button>
      </div>
    </div>
  );
}

function ImpactBar({
  label,
  value,
  color,
  textColor,
  prefix,
}: {
  label: string;
  value: number;
  color: string;
  textColor: string;
  prefix: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground w-14 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("font-semibold tabular-nums w-12 text-right text-sm", textColor)}>
        {prefix}
        {value}
      </span>
    </div>
  );
}
