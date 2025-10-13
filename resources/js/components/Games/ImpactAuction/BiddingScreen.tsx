import React, { useState, useEffect } from "react";
import {
  AuctionItem,
  PlayerAuctionState,
  AuctionGameState,
} from "@/types/impactauction";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const getAvatarUrl = (avatar?: string): string | null => {
  if (!avatar) return null;
  return `/storage/${avatar}`;
};

interface Props {
  currentItem: AuctionItem;
  playerState: PlayerAuctionState;
  gameState: AuctionGameState;
  onPlaceBid: (amount: number) => void;
  timeLeft: number;
  playersWhoPlacedBids: number[];
  onlineUsers: any[];
}

export function BiddingScreen({
  currentItem,
  playerState,
  gameState,
  onPlaceBid,
  timeLeft,
  playersWhoPlacedBids,
  onlineUsers,
}: Props) {
  const [bidAmount, setBidAmount] = useState(0);
  const maxBid = playerState.budget;

  useEffect(() => {
    // Reset bid amount when item changes
    setBidAmount(0);
  }, [currentItem.id]);

  const handleBidChange = (value: number[]) => {
    setBidAmount(value[0]);
  };

  const handlePlaceBid = () => {
    if (bidAmount > 0 && bidAmount <= maxBid) {
      onPlaceBid(bidAmount);
    }
  };

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

  const itemNumber = gameState.currentItemIndex + 1;
  const totalItems = gameState.items.length;
  const progressPercentage = (itemNumber / totalItems) * 100;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Impact Auction
              </h1>
              <p className="text-gray-600">
                Item {itemNumber} of {totalItems}
              </p>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div
                className={`text-5xl font-bold ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-900"}`}
              >
                {timeLeft}s
              </div>
              <p className="text-gray-600 text-sm">Time Left</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Item Display */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 h-full">
              {/* Category Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-white font-semibold text-sm bg-gradient-to-r ${getCategoryColor(currentItem.category)}`}
                >
                  {getCategoryLabel(currentItem.category)}
                </span>
              </div>

              {/* Item Name */}
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {currentItem.name}
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                {currentItem.description}
              </p>

              {/* Mystery Impact */}
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-yellow-400/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-yellow-600">
                    Real-World Impact
                  </h3>
                </div>
                <p className="text-gray-600 italic">
                  The true impact of this innovation will be revealed after all
                  bidding is complete...
                </p>
              </div>
            </div>
          </div>

          {/* Bidding Panel */}
          <div className="space-y-6">
            {/* Budget Display */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Budget
              </h3>
              <div className="text-4xl font-bold text-yellow-600">
                {playerState.budget}
              </div>
              <p className="text-gray-600 text-sm">Impact Points Remaining</p>
            </div>

            {/* Bid Controls */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Place Your Bid
              </h3>

              {playerState.hasPlacedBid ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold mb-2">
                    Bid Placed!
                  </p>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {playerState.currentBid}
                  </div>
                  <p className="text-gray-600 text-sm">Impact Points</p>
                </div>
              ) : (
                <>
                  {/* Bid Amount Display */}
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {bidAmount}
                    </div>
                    <p className="text-gray-600">Impact Points</p>
                  </div>

                  {/* Slider */}
                  <div className="mb-6 px-2">
                    <Slider
                      value={[bidAmount]}
                      onValueChange={handleBidChange}
                      max={maxBid}
                      min={0}
                      step={10}
                      className="w-full"
                      disabled={playerState.hasPlacedBid}
                    />
                    <div className="flex justify-between text-gray-600 text-sm mt-2">
                      <span>0</span>
                      <span>{maxBid}</span>
                    </div>
                  </div>

                  {/* Quick Bid Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[25, 50, 75, 100].map((percentage) => {
                      const amount = Math.floor((maxBid * percentage) / 100);
                      return (
                        <Button
                          key={percentage}
                          onClick={() => setBidAmount(amount)}
                          variant="outline"
                          size="sm"
                          className="bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-300"
                          disabled={playerState.hasPlacedBid}
                        >
                          {percentage}%
                        </Button>
                      );
                    })}
                  </div>

                  {/* Place Bid Button */}
                  <Button
                    onClick={handlePlaceBid}
                    disabled={
                      bidAmount === 0 ||
                      bidAmount > maxBid ||
                      playerState.hasPlacedBid
                    }
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 text-lg shadow-sm"
                  >
                    {bidAmount === 0 ? "Set Bid Amount" : "Place Bid"}
                  </Button>
                </>
              )}
            </div>

            {/* Players Status */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bidding Status
              </h3>
              <div className="space-y-2">
                {Object.values(gameState.playerStates).map((player) => {
                  const user = onlineUsers.find((u) => u.id === player.userId);
                  return (
                    <div
                      key={player.userId}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="w-8 h-8"
                          decoration={user?.decoration}
                        >
                          <AvatarImage
                            src={getAvatarUrl(user?.avatar) || undefined}
                            alt={user?.name || "Player"}
                          />
                          <AvatarFallback className="text-xs">
                            {user?.name?.charAt(0)?.toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-800 font-medium">
                          {user?.name || `Player ${player.userId}`}
                        </span>
                      </div>
                      {player.hasPlacedBid ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Bid Placed
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-gray-500">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          Thinking...
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
