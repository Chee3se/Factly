import React from "react";
import {
  AuctionItem,
  ItemWinner,
  AuctionGameState,
} from "@/types/impactauction";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LobbyChat from "@/components/Lobby/LobbyChat";
import { Lobby } from "@/types/lobby";
import { useLobby } from "@/hooks/useLobby";

const getAvatarUrl = (avatar?: string): string | null => {
  if (!avatar) return null;
  return `/storage/${avatar}`;
};

interface Props {
  item: AuctionItem;
  winner: ItemWinner;
  gameState: AuctionGameState;
  onContinue?: () => void;
  isGameOwner: boolean;
  players: any[];
  currentLobby: Lobby | null;
  lobbyHook: ReturnType<typeof useLobby>;
}

export function RevealScreen({
  item,
  winner,
  gameState,
  onContinue,
  isGameOwner,
  players,
  currentLobby,
  lobbyHook,
}: Props) {
  const winnerUser = players.find((p) => p.id === winner.winnerId);

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

  // Sort bids from highest to lowest
  const sortedBids = [...winner.allBids].sort(
    (a, b) => b.bidAmount - a.bidAmount,
  );

  return (
    <div className="p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Winner Announcement */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30 animate-pulse"></div>
                <h1 className="relative text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500">
                  SOLD!
                </h1>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Item Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <span
                className={`inline-block px-4 py-2 rounded-full text-white font-semibold text-sm bg-gradient-to-r ${getCategoryColor(item.category)} mb-4`}
              >
                {getCategoryLabel(item.category)}
              </span>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {item.name}
              </h2>

              <p className="text-gray-600 mb-6">{item.description}</p>

              {/* Winner Info */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-400">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-8 h-8 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900">Winner</h3>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar
                    className="w-10 h-10"
                    decoration={winnerUser?.decoration}
                  >
                    <AvatarImage
                      src={getAvatarUrl(winnerUser?.avatar)}
                      alt={winner.winnerName}
                    />
                    <AvatarFallback className="text-sm">
                      {winner.winnerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-gray-800 font-semibold">
                    {winner.winnerName}
                  </p>
                </div>
                <div className="text-4xl font-bold text-yellow-600">
                  {winner.winningBid}
                </div>
                <p className="text-gray-500 text-sm">Impact Points</p>
              </div>
            </div>

            {/* All Bids */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                All Bids
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedBids.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No bids were placed on this item</p>
                  </div>
                ) : (
                  sortedBids.map((bid, index) => {
                    const isWinner = bid.userId === winner.winnerId;
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
                        key={bid.userId}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                          isWinner
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 scale-105"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {medal && <span className="text-2xl">{medal}</span>}
                          <div className="flex items-center gap-2">
                            <Avatar
                              className="w-6 h-6"
                              decoration={
                                players.find((p) => p.id === bid.userId)
                                  ?.decoration
                              }
                            >
                              <AvatarImage
                                src={getAvatarUrl(
                                  players.find((p) => p.id === bid.userId)
                                    ?.avatar,
                                )}
                                alt={bid.userName}
                              />
                              <AvatarFallback className="text-xs">
                                {bid.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p
                                className={`font-semibold ${isWinner ? "text-yellow-600" : "text-gray-900"}`}
                              >
                                {bid.userName}
                                {isWinner && (
                                  <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
                                    WINNER
                                  </span>
                                )}
                              </p>
                              {bid.bidAmount === 0 && (
                                <p className="text-xs text-gray-500">Passed</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-2xl font-bold ${isWinner ? "text-yellow-600" : "text-gray-700"}`}
                        >
                          {bid.bidAmount}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Next Item Info */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 inline-block">
              <p className="text-gray-600 mb-2">
                {gameState.currentItemIndex < gameState.items.length - 1
                  ? "Preparing next item..."
                  : "Preparing final results..."}
              </p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Chat Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
            <LobbyChat auth={lobbyHook.auth} lobbyHook={lobbyHook} />
          </div>
        </div>
      </div>
    </div>
  );
}
