import React from "react";
import App from "@/layouts/App";
import { Game } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

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
  const getAvatarUrl = (avatar?: string): string | undefined => {
    if (!avatar) return undefined;
    return `/storage/${avatar}`;
  };

  const getRankIcon = (rank: number) => {
    const textColor =
      rank <= 3 ? "text-white" : "text-gray-900 dark:text-gray-100";
    return <span className={`text-sm font-bold ${textColor}`}>#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-transparent";
    }
  };

  return (
    <App title="Leaderboards" auth={auth}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Leaderboards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank against other players across all games
          </p>
        </div>

        {leaderboards.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              No scores yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to play and set a high score!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {leaderboards.map(({ game, leaderboard }) => (
              <Card key={game.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center gap-4">
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
                      }}
                    />
                    <div>
                      <CardTitle className="text-2xl">{game.name}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No scores recorded for this game yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {leaderboard
                        .sort((a, b) => {
                          // Sort by position first, then by score
                          const aPos = a.position || leaderboard.indexOf(a) + 1;
                          const bPos = b.position || leaderboard.indexOf(b) + 1;
                          return aPos - bPos;
                        })
                        .map((entry, index) => {
                          // Use position field if available (for current user not in top 5), otherwise use array index + 1
                          const rank = entry.position || index + 1;
                          const isCurrentUser = auth.user?.id === entry.user.id;

                          return (
                            <div
                              key={entry.user_id}
                              className={`flex items-center justify-between p-4 ${
                                isCurrentUser
                                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 shadow-sm"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`flex items-center justify-center w-10 h-10 ${
                                    rank <= 3 ? "rounded-full" : ""
                                  } ${getRankColor(rank)}`}
                                >
                                  {getRankIcon(rank)}
                                </div>

                                <div className="flex items-center gap-3">
                                  <Avatar
                                    className="w-10 h-10"
                                    decoration={
                                      entry.user.decoration || undefined
                                    }
                                  >
                                    <AvatarImage
                                      src={getAvatarUrl(
                                        entry.user.avatar || undefined,
                                      )}
                                      alt={entry.user.name}
                                    />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      {entry.user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {entry.user.name}
                                      {isCurrentUser && (
                                        <Badge
                                          variant="secondary"
                                          className="ml-2 text-xs"
                                        >
                                          You
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {entry.best_score.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  points
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </App>
  );
}
