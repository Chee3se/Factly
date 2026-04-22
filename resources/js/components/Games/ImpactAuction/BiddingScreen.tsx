import React, { useState, useEffect } from "react";
import {
  AuctionItem,
  PlayerAuctionState,
  AuctionGameState,
} from "@/types/impactauction";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, Sparkles, Clock } from "lucide-react";

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
    setBidAmount(0);
  }, [currentItem.id]);

  const categoryGradient =
    CATEGORY_COLORS[currentItem.category] || "from-slate-500 to-slate-600";

  const categoryLabel = currentItem.category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const itemNumber = gameState.currentItemIndex + 1;
  const totalItems = gameState.items.length;
  const progressPercentage = (itemNumber / totalItems) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Impact Auction
            </h1>
            <p className="text-sm text-muted-foreground">
              Item {itemNumber} of {totalItems}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft <= 5
                ? "bg-red-500/10 text-red-500 animate-pulse"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-xl font-bold tabular-nums">{timeLeft}s</span>
          </div>
        </div>

        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${categoryGradient} transition-all duration-300`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Item card */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-8 h-full relative overflow-hidden">
            <div
              className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${categoryGradient} opacity-10 blur-3xl`}
            />

            <div className="relative">
              <span
                className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-xs uppercase tracking-wider bg-gradient-to-r ${categoryGradient} mb-4`}
              >
                {categoryLabel}
              </span>

              <h2 className="text-4xl font-bold tracking-tight mb-4">
                {currentItem.name}
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {currentItem.description}
              </p>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Real-World Impact
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  The true impact is revealed after every bid is in.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Budget */}
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Your Budget
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {playerState.budget}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                pts
              </span>
            </div>
          </div>

          {/* Bid controls */}
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-5">
            {playerState.hasPlacedBid ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-semibold mb-1">Bid locked in</p>
                <div className="text-3xl font-bold tabular-nums">
                  {playerState.currentBid}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Waiting for other players…
                </p>
              </div>
            ) : (
              <>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                  Place your bid
                </div>

                <div className="text-center mb-5">
                  <div className="text-4xl font-bold tabular-nums">
                    {bidAmount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    impact points
                  </div>
                </div>

                <div className="mb-4">
                  <Slider
                    value={[bidAmount]}
                    onValueChange={(v) => setBidAmount(v[0])}
                    max={maxBid}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular-nums">
                    <span>0</span>
                    <span>{maxBid}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[25, 50, 75, 100].map((pct) => {
                    const amount = Math.floor((maxBid * pct) / 100);
                    return (
                      <Button
                        key={pct}
                        onClick={() => setBidAmount(amount)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {pct}%
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => bidAmount > 0 && onPlaceBid(bidAmount)}
                  disabled={bidAmount === 0 || bidAmount > maxBid}
                  className="w-full"
                  size="lg"
                >
                  {bidAmount === 0 ? "Set bid amount" : "Place bid"}
                </Button>
              </>
            )}
          </div>

          {/* Players status */}
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              Bidding status
            </div>
            <ul className="space-y-1">
              {Object.values(gameState.playerStates).map((player) => {
                const user = onlineUsers.find((u) => u.id === player.userId);
                return (
                  <li
                    key={player.userId}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        className="w-7 h-7 shrink-0"
                        decoration={user?.decoration}
                      >
                        <AvatarImage
                          src={getAvatarUrl(user?.avatar) || undefined}
                          alt={user?.name || "Player"}
                        />
                        <AvatarFallback className="text-xs bg-muted text-foreground">
                          {user?.name?.charAt(0)?.toUpperCase() || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {user?.name || `Player ${player.userId}`}
                      </span>
                    </div>
                    {player.hasPlacedBid ? (
                      <span className="text-xs font-medium text-emerald-500 flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        Bid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse" />
                        Thinking
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
