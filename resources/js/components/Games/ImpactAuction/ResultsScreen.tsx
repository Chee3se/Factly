import React, { useEffect, useState } from "react";
import {
  AuctionGameState,
  AuctionItem,
  ItemWinner,
} from "@/types/impactauction";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Lobby } from "@/types/lobby";
import { useLobby } from "@/hooks/useLobby";
import { cn } from "@/lib/utils";

const getAvatarUrl = (avatar?: string): string | undefined => {
  if (!avatar) return undefined;
  return `/storage/${avatar}`;
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

export function ResultsScreen({
  gameState,
  onLeaveLobby,
  currentLobby,
  players,
  lobbyHook,
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
      }, 800);
      return () => clearTimeout(timer);
    } else if (
      currentRevealIndex === gameState.itemWinners.length &&
      !showLeaderboard
    ) {
      const timer = setTimeout(() => setShowLeaderboard(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentRevealIndex, gameState.itemWinners.length, showLeaderboard]);

  const calculatePlayerScores = (): PlayerScore[] => {
    const scores: { [userId: number]: PlayerScore } = {};

    // Initialize scores for all players
    Object.values(gameState.playerStates).forEach((playerState) => {
      const player = currentLobby?.players?.find(
        (p) => p.id === playerState.userId,
      );
      scores[playerState.userId] = {
        userId: playerState.userId,
        userName: player?.name || `Player ${playerState.userId}`,
        totalImpact: 0,
        positiveImpact: 0,
        negativeImpact: 0,
        itemsWon: 0,
        totalSpent: 0,
      };
    });

    // Calculate scores based on items won
    gameState.itemWinners.forEach((winner) => {
      const item = gameState.items.find((i) => i.id === winner.itemId);
      if (item && winner.winningBid > 0) {
        if (scores[winner.winnerId]) {
          scores[winner.winnerId].totalImpact += item.net_impact;
          scores[winner.winnerId].positiveImpact += item.positive_impact;
          scores[winner.winnerId].negativeImpact += item.negative_impact;
          scores[winner.winnerId].itemsWon += 1;
          scores[winner.winnerId].totalSpent += winner.winningBid;
        }
      }
    });

    return Object.values(scores).sort((a, b) => b.totalImpact - a.totalImpact);
  };

  const playerScores = calculatePlayerScores();
  const winner = playerScores[0];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "renewable-energy": "from-green-500 to-emerald-600",
      "social-media": "from-blue-500 to-indigo-600",
      healthcare: "from-red-500 to-pink-600",
      "space-travel": "from-purple-500 to-violet-600",
      education: "from-yellow-500 to-orange-600",
      transportation: "from-cyan-500 to-teal-600",
      agriculture: "from-lime-500 to-green-600",
      communication: "from-sky-500 to-blue-600",
      technology: "from-fuchsia-500 to-purple-600",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 50) return "text-green-400";
    if (impact >= 20) return "text-lime-400";
    if (impact >= 0) return "text-yellow-400";
    if (impact >= -20) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div>
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              Impact Revealed!
            </h1>
            <p className="text-xl text-gray-600">
              Let's see how your choices impacted the world
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {gameState.itemWinners.map((itemWinner, index) => {
              const item = gameState.items.find(
                (i) => i.id === itemWinner.itemId,
              );
              const isRevealed = revealedItems.includes(index);

              if (!item) return <div key={itemWinner.itemId}></div>;

              const player = currentLobby?.players?.find(
                (p) => p.id === itemWinner.winnerId,
              );
              const playerName =
                player?.name || `Player ${itemWinner.winnerId}`;
              const nobodyWon = itemWinner.winningBid === 0;

              return (
                <div
                  key={itemWinner.itemId}
                  className={cn(
                    "transition-all duration-500 transform",
                    isRevealed
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4",
                  )}
                >
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span
                                className={cn(
                                  "inline-block px-3 py-1 rounded-full text-white font-semibold text-xs mb-2 bg-gradient-to-r",
                                  getCategoryColor(item.category),
                                )}
                              >
                                {getCategoryLabel(item.category)}
                              </span>
                              <h3 className="text-2xl font-bold text-gray-900">
                                {item.name}
                              </h3>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4 text-sm">
                            {item.description}
                          </p>

                          {nobodyWon ? (
                            <div className="inline-flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-full">
                              <svg
                                className="w-5 h-5 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-600 font-semibold">
                                No Winner
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-400">
                              <Avatar
                                className="w-6 h-6"
                                decoration={
                                  players.find(
                                    (p) => p.id === itemWinner.winnerId,
                                  )?.decoration
                                }
                              >
                                <AvatarImage
                                  src={getAvatarUrl(
                                    players.find(
                                      (p) => p.id === itemWinner.winnerId,
                                    )?.avatar,
                                  )}
                                  alt={playerName}
                                />
                                <AvatarFallback className="text-xs">
                                  {playerName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-900 font-semibold">
                                {playerName}
                              </span>
                              <span className="text-yellow-600 font-bold">
                                {itemWinner.winningBid} pts
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="md:w-80">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Real-World Impact
                            </h4>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">
                                  Positive:
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                                      style={{
                                        width: `${item.positive_impact}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-green-600 font-bold w-12 text-right">
                                    +{item.positive_impact}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">
                                  Negative:
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-red-500 to-rose-600"
                                      style={{
                                        width: `${item.negative_impact}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-red-500 font-bold w-12 text-right">
                                    -{item.negative_impact}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900 font-semibold">
                                    Net Impact:
                                  </span>
                                  <span
                                    className={cn(
                                      "text-2xl font-bold",
                                      getImpactColor(item.net_impact),
                                    )}
                                  >
                                    {item.net_impact > 0 ? "+" : ""}
                                    {item.net_impact}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 bg-gray-100 rounded-lg p-3 border border-gray-200">
                            <p className="text-gray-600 text-xs italic">
                              {item.impact_description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {showLeaderboard && (
            <div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    Final Leaderboard
                  </h2>
                  <p className="text-gray-600">Ranked by Total Impact Score</p>
                </div>

                <div className="space-y-4">
                  {playerScores.map((score, index) => {
                    const isWinner = index === 0;
                    const medal =
                      index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : null;

                    return (
                      <div
                        key={score.userId}
                        className={cn(
                          "flex items-center gap-4 p-6 rounded-xl transition-all",
                          isWinner
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 scale-105"
                            : "bg-gray-50 border border-gray-200",
                        )}
                      >
                        <div className="flex items-center justify-center w-12 h-12">
                          {medal ? (
                            <span className="text-4xl">{medal}</span>
                          ) : (
                            <span className="text-2xl font-bold text-gray-500">
                              #{index + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                          <Avatar
                            className="w-10 h-10"
                            decoration={
                              players.find((p) => p.id === score.userId)
                                ?.decoration
                            }
                          >
                            <AvatarImage
                              src={getAvatarUrl(
                                players.find((p) => p.id === score.userId)
                                  ?.avatar,
                              )}
                              alt={score.userName}
                            />
                            <AvatarFallback className="text-sm">
                              {score.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3
                                className={cn(
                                  "text-xl font-bold",
                                  isWinner
                                    ? "text-yellow-600"
                                    : "text-gray-900",
                                )}
                              >
                                {score.userName}
                              </h3>
                              {isWinner && (
                                <span className="text-xs bg-yellow-400 text-black px-3 py-1 rounded-full">
                                  WINNER
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{score.itemsWon} items won</span>
                              <span>•</span>
                              <span>{score.totalSpent} points spent</span>
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-green-600 font-bold">
                              +{score.positiveImpact}
                            </div>
                            <div className="text-xs text-gray-500">
                              Positive
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-600 font-bold">
                              -{score.negativeImpact}
                            </div>
                            <div className="text-xs text-gray-500">
                              Negative
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={cn(
                              "text-3xl font-bold",
                              getImpactColor(score.totalImpact),
                            )}
                          >
                            {score.totalImpact > 0 ? "+" : ""}
                            {score.totalImpact}
                          </div>
                          <div className="text-xs text-gray-500">
                            Total Impact
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {winner && (
                  <div className="mt-8 text-center">
                    <div className="inline-block bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-400 p-6">
                      <div className="text-6xl mb-3">🏆</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Congratulations, {winner.userName}!
                      </h3>
                      <p className="text-gray-600">
                        You built the most impactful portfolio with a total
                        impact of{" "}
                        <span
                          className={cn(
                            "font-bold",
                            getImpactColor(winner.totalImpact),
                          )}
                        >
                          {winner.totalImpact > 0 ? "+" : ""}
                          {winner.totalImpact}
                        </span>
                        !
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={onLeaveLobby}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-6 text-lg"
            >
              Return to Lobby
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
