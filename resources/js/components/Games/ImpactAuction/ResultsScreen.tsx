import React, { useEffect, useState } from "react";
import { AuctionGameState, AuctionItem, ItemWinner } from "@/types/impactauction";
import { Button } from "@/components/ui/button";

interface Props {
  gameState: AuctionGameState;
  onLeaveLobby: () => void;
  currentLobby: Lobby | null;
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

export function ResultsScreen({ gameState, onLeaveLobby, currentLobby }: Props) {
  const [revealedItems, setRevealedItems] = useState<number[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    // Animate item reveals one by one
    const timer = setTimeout(() => {
      if (revealedItems.length < gameState.itemWinners.length) {
        setRevealedItems([...revealedItems, revealedItems.length]);
      } else if (revealedItems.length === gameState.itemWinners.length) {
        // Show leaderboard after all items revealed
        setTimeout(() => setShowLeaderboard(true), 1000);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [revealedItems, gameState.itemWinners.length]);

  const calculatePlayerScores = (): PlayerScore[] => {
    const scores: { [userId: number]: PlayerScore } = {};

    // Initialize scores for all players
    Object.values(gameState.playerStates).forEach((playerState) => {
      const player = currentLobby?.players?.find(p => p.id === playerState.userId);
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
      const item = gameState.items.find(i => i.id === winner.itemId);
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
      'renewable-energy': 'from-green-500 to-emerald-600',
      'social-media': 'from-blue-500 to-indigo-600',
      'healthcare': 'from-red-500 to-pink-600',
      'space-travel': 'from-purple-500 to-violet-600',
      'education': 'from-yellow-500 to-orange-600',
      'transportation': 'from-cyan-500 to-teal-600',
      'agriculture': 'from-lime-500 to-green-600',
      'communication': 'from-sky-500 to-blue-600',
      'technology': 'from-fuchsia-500 to-purple-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 50) return 'text-green-400';
    if (impact >= 20) return 'text-lime-400';
    if (impact >= 0) return 'text-yellow-400';
    if (impact >= -20) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Impact Revealed!</h1>
          <p className="text-xl text-white/70">Let's see how your choices impacted the world</p>
        </div>

        {/* Impact Reveals */}
        <div className="space-y-4 mb-8">
          {gameState.itemWinners.map((itemWinner, index) => {
            const item = gameState.items.find(i => i.id === itemWinner.itemId);
            const isRevealed = revealedItems.includes(index);

            if (!item) return null;

            const player = currentLobby?.players?.find(p => p.id === itemWinner.winnerId);
            const playerName = player?.name || `Player ${itemWinner.winnerId}`;
            const nobodyWon = itemWinner.winningBid === 0;

            return (
              <div
                key={itemWinner.itemId}
                className={`transition-all duration-500 transform ${
                  isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-xs bg-gradient-to-r ${getCategoryColor(item.category)} mb-2`}>
                              {getCategoryLabel(item.category)}
                            </span>
                            <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                          </div>
                        </div>

                        <p className="text-white/70 mb-4 text-sm">{item.description}</p>

                        {/* Winner Badge */}
                        {nobodyWon ? (
                          <div className="inline-flex items-center gap-2 bg-gray-500/30 px-4 py-2 rounded-full">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white/60 font-semibold">No Winner</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-400/50">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-white font-semibold">{playerName}</span>
                            <span className="text-yellow-400 font-bold">{itemWinner.winningBid} pts</span>
                          </div>
                        )}
                      </div>

                      {/* Impact Stats */}
                      <div className="md:w-80">
                        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Real-World Impact
                          </h4>

                          <div className="space-y-3">
                            {/* Positive Impact */}
                            <div className="flex items-center justify-between">
                              <span className="text-white/70 text-sm">Positive:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                    style={{ width: `${item.positive_impact}%` }}
                                  />
                                </div>
                                <span className="text-green-400 font-bold w-12 text-right">+{item.positive_impact}</span>
                              </div>
                            </div>

                            {/* Negative Impact */}
                            <div className="flex items-center justify-between">
                              <span className="text-white/70 text-sm">Negative:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-400 to-rose-500"
                                    style={{ width: `${item.negative_impact}%` }}
                                  />
                                </div>
                                <span className="text-red-400 font-bold w-12 text-right">-{item.negative_impact}</span>
                              </div>
                            </div>

                            {/* Net Impact */}
                            <div className="pt-2 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-semibold">Net Impact:</span>
                                <span className={`text-2xl font-bold ${getImpactColor(item.net_impact)}`}>
                                  {item.net_impact > 0 ? '+' : ''}{item.net_impact}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Impact Description */}
                        <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-white/60 text-xs italic">{item.impact_description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="animate-fade-in">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-2">Final Leaderboard</h2>
                <p className="text-white/70">Ranked by Total Impact Score</p>
              </div>

              <div className="space-y-4">
                {playerScores.map((score, index) => {
                  const isWinner = index === 0;
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

                  return (
                    <div
                      key={score.userId}
                      className={`flex items-center gap-4 p-6 rounded-xl transition-all ${
                        isWinner
                          ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 scale-105'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {medal ? (
                          <span className="text-4xl">{medal}</span>
                        ) : (
                          <span className="text-2xl font-bold text-white/40">#{index + 1}</span>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                          {score.userName}
                          {isWinner && (
                            <span className="ml-2 text-xs bg-yellow-400 text-black px-3 py-1 rounded-full">
                              WINNER
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                          <span>{score.itemsWon} items won</span>
                          <span>•</span>
                          <span>{score.totalSpent} points spent</span>
                        </div>
                      </div>

                      {/* Impact Breakdown */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-green-400 font-bold">+{score.positiveImpact}</div>
                          <div className="text-xs text-white/50">Positive</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-400 font-bold">-{score.negativeImpact}</div>
                          <div className="text-xs text-white/50">Negative</div>
                        </div>
                      </div>

                      {/* Total Impact */}
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getImpactColor(score.totalImpact)}`}>
                          {score.totalImpact > 0 ? '+' : ''}{score.totalImpact}
                        </div>
                        <div className="text-xs text-white/50">Total Impact</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Winner Celebration */}
              {winner && (
                <div className="mt-8 text-center">
                  <div className="inline-block bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border-2 border-yellow-400 p-6">
                    <div className="text-6xl mb-3">🏆</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Congratulations, {winner.userName}!
                    </h3>
                    <p className="text-white/70">
                      You built the most impactful portfolio with a total impact of{' '}
                      <span className={`font-bold ${getImpactColor(winner.totalImpact)}`}>
                        {winner.totalImpact > 0 ? '+' : ''}{winner.totalImpact}
                      </span>
                      !
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="text-center">
              <Button
                onClick={onLeaveLobby}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-6 text-lg"
              >
                Return to Lobby
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
