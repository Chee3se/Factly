import React, { useState } from "react";
import App from "@/layouts/App";
import { Game } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_id: number;
  best_score: number;
  position?: number;
  user: {
    id: number;
    name: string;
    avatar: string | null;
    decoration: {
      id: number;
      name: string;
      description: string;
      image_url: string;
    } | null;
  };
}

interface LeaderboardData {
  game: Game;
  leaderboard: LeaderboardEntry[];
}

interface Props {
  auth: Auth;
  leaderboards: LeaderboardData[];
}

export default function Leaderboards({ auth, leaderboards }: Props) {
  const [activeGame, setActiveGame] = useState<number | null>(
    leaderboards[0]?.game.id ?? null,
  );

  const getAvatarUrl = (avatar?: string): string | undefined => {
    if (!avatar) return undefined;
    return `/storage/${avatar}`;
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return null;
  };

  const active = leaderboards.find((l) => l.game.id === activeGame);

  return (
    <App title="Leaderboards" auth={auth}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Leaderboards
          </h1>
          <p className="text-muted-foreground">
            Top players across every game.
          </p>
        </div>

        {leaderboards.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-16 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No scores yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to play and set a high score.
            </p>
          </div>
        ) : (
          <>
            {/* Game tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {leaderboards.map(({ game }) => {
                const isActive = game.id === activeGame;
                return (
                  <button
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      isActive
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background/80 backdrop-blur border-border/60 hover:border-foreground/40"
                    }`}
                  >
                    {game.name}
                  </button>
                );
              })}
            </div>

            {active && (
              <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur overflow-hidden">
                {active.leaderboard.length === 0 ? (
                  <div className="p-16 text-center text-muted-foreground text-sm">
                    No scores recorded for this game yet.
                  </div>
                ) : (
                  <ul>
                    {active.leaderboard
                      .slice()
                      .sort((a, b) => {
                        const aPos =
                          a.position ?? active.leaderboard.indexOf(a) + 1;
                        const bPos =
                          b.position ?? active.leaderboard.indexOf(b) + 1;
                        return aPos - bPos;
                      })
                      .map((entry, index) => {
                        const rank = entry.position ?? index + 1;
                        const isCurrentUser = auth.user?.id === entry.user.id;
                        const isTopThree = rank <= 3;

                        return (
                          <li
                            key={entry.user_id}
                            className={`flex items-center gap-4 px-6 py-4 border-b border-border/40 last:border-b-0 ${
                              isCurrentUser ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center justify-center w-10 shrink-0">
                              {isTopThree ? (
                                rankIcon(rank)
                              ) : (
                                <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                                  {rank}
                                </span>
                              )}
                            </div>

                            <Avatar
                              className="w-10 h-10 shrink-0"
                              decoration={entry.user.decoration || undefined}
                            >
                              <AvatarImage
                                src={getAvatarUrl(
                                  entry.user.avatar || undefined,
                                )}
                                alt={entry.user.name}
                              />
                              <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                                {entry.user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate flex items-center gap-2">
                                {entry.user.name}
                                {isCurrentUser && (
                                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right tabular-nums">
                              <div className="text-lg font-bold">
                                {entry.best_score.toLocaleString()}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </App>
  );
}
