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
import { Crown, Medal, Award } from "lucide-react";

const getAvatarUrl = (avatar?: string): string | null =>
  avatar ? `/storage/${avatar}` : null;

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
  players,
  lobbyHook,
}: Props) {
  const winnerUser = players.find((p) => p.id === winner.winnerId);
  const categoryGradient =
    CATEGORY_COLORS[item.category] || "from-slate-500 to-slate-600";
  const categoryLabel = item.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const sortedBids = [...winner.allBids].sort(
    (a, b) => b.bidAmount - a.bidAmount,
  );

  const rankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-4 h-4 text-slate-400" />;
    if (rank === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mx-auto">
      <div className="lg:col-span-2 space-y-4">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            SOLD
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Item + winner */}
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-6 relative overflow-hidden">
            <div
              className={`absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br ${categoryGradient} opacity-10 blur-3xl`}
            />

            <div className="relative">
              <span
                className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-xs uppercase tracking-wider bg-gradient-to-r ${categoryGradient} mb-3`}
              >
                {categoryLabel}
              </span>

              <h2 className="text-2xl font-bold tracking-tight mb-2">
                {item.name}
              </h2>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {item.description}
              </p>

              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-yellow-700 dark:text-yellow-400">
                    Winner
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <Avatar
                    className="w-10 h-10"
                    decoration={winnerUser?.decoration}
                  >
                    <AvatarImage
                      src={getAvatarUrl(winnerUser?.avatar) || undefined}
                      alt={winner.winnerName}
                    />
                    <AvatarFallback className="text-sm bg-muted">
                      {winner.winnerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{winner.winnerName}</span>
                </div>
                <div className="text-3xl font-bold tabular-nums">
                  {winner.winningBid}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* All bids */}
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-6">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4">
              All Bids
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {sortedBids.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No bids were placed on this item
                </div>
              ) : (
                sortedBids.map((bid, index) => {
                  const isWinner = bid.userId === winner.winnerId;
                  const player = players.find((p) => p.id === bid.userId);

                  return (
                    <div
                      key={bid.userId}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isWinner ? "bg-primary/5" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {index < 3 ? (
                            rankIcon(index)
                          ) : (
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <Avatar
                          className="w-7 h-7 shrink-0"
                          decoration={player?.decoration}
                        >
                          <AvatarImage
                            src={getAvatarUrl(player?.avatar) || undefined}
                            alt={bid.userName}
                          />
                          <AvatarFallback className="text-xs bg-muted">
                            {bid.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {bid.userName}
                          </p>
                          {bid.bidAmount === 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              Passed
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="font-bold tabular-nums">
                        {bid.bidAmount}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full px-5 py-3 border border-border/60 bg-background/80 backdrop-blur">
            <span className="text-sm text-muted-foreground">
              {gameState.currentItemIndex < gameState.items.length - 1
                ? "Preparing next item"
                : "Preparing final results"}
            </span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur h-full overflow-hidden flex flex-col">
          <LobbyChat auth={lobbyHook.auth} lobbyHook={lobbyHook} />
        </div>
      </div>
    </div>
  );
}
