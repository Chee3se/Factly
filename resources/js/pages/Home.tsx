import React, { useState, useEffect } from "react";

import App from "@/layouts/App";
import { Game } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Gamepad, Lightbulb, Plus, Sparkles } from "lucide-react";
import SuggestionModal from "@/components/SuggestionModal";
import { toast } from "sonner";
import FriendsSidebar from "@/components/FriendsSidebar";
import LobbyNotificationBanner from "@/components/Lobby/LobbyNotificationBanner";
import HeroScreen from "@/components/Home/HeroScreen";
import { useLobby } from "@/hooks/useLobby";

interface Props {
  auth: Auth;
  games: Game[];
  flash: {
    success?: string;
    error?: string;
  };
}

export default function Home({ auth, games, flash }: Props) {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHeroScreen, setShowHeroScreen] = useState(false);

  const { currentLobby, leaveLobby } = useLobby(auth.user?.id);

  useEffect(() => {
    if (flash.success) {
      toast.success(flash.success);
    }
  }, [flash.success]);

  useEffect(() => {
    if (currentLobby && currentLobby.started) {
      console.log(
        "Automatically leaving started lobby:",
        currentLobby.lobby_code,
      );
      leaveLobby();
    }
  }, [currentLobby, leaveLobby]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenHero = localStorage.getItem("hasSeenHeroScreen");
      console.log("Has seen hero:", hasSeenHero);
      if (!hasSeenHero || hasSeenHero !== "true") {
        setShowHeroScreen(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleHeroComplete = () => {
    localStorage.setItem("hasSeenHeroScreen", "true");
    setShowHeroScreen(false);
  };

  const handleSuggestionClick = () => {
    if (!auth.user) {
      toast.error("Please log in to submit a suggestion");
      return;
    }
    setShowSuggestionModal(true);
  };

  return (
    <>
      <style>{`
        @keyframes move-bg-diagonal {
          0% { transform: rotate(45deg) scale(150%) translateX(0); }
          100% { transform: rotate(45deg) scale(150%) translateX(15%); }
        }
      `}</style>
      <App title={"Home"} auth={auth}>
        {/* Full Screen Animated Background Elements - Rotated 45 degrees */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ animation: "move-bg-diagonal 10s linear infinite" }}
          >
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          </div>
        </div>
        <div className="relative z-10">
          <LobbyNotificationBanner currentLobby={currentLobby} />
          {/* Main Content Area */}
          <div className="container mx-auto px-4 py-8">
            {/* Header with suggestion button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Games
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Choose a game to play or suggest a new one
                </p>
              </div>

              <Button
                onClick={handleSuggestionClick}
                variant="outline"
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-yellow-200 text-yellow-700 hover:text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700/50 dark:text-yellow-400 dark:hover:text-yellow-300"
              >
                <Lightbulb className="h-4 w-4" />
                Suggest a Game
              </Button>
            </div>

            {!games || games.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No games available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Be the first to suggest a game idea!
                </p>
                <Button
                  onClick={handleSuggestionClick}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Suggest the First Game
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => (
                  <Card
                    key={game.id}
                    className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/20"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={game.thumbnail}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                          {game.name}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-2">
                      <CardDescription className="text-sm line-clamp-2 mb-2">
                        {game.description}
                      </CardDescription>

                      {(game.min_players > 0 || game.max_players > 0) && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>
                              {game.min_players === game.max_players
                                ? `${game.min_players} player${game.min_players !== 1 ? "s" : ""}`
                                : `${game.min_players}-${game.max_players} players`}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="mt-auto">
                      <div className="w-full space-y-2">
                        <Button
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          onClick={() =>
                            (window.location.href = `/games/${game.slug}`)
                          }
                        >
                          Play Game
                          <Gamepad className="ml-2 h-4 w-4" />
                        </Button>
                        {game.slug === "curators-test" && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              (window.location.href = `/games/curators-test/gallery`)
                            }
                          >
                            View Gallery
                            <Sparkles className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Suggestion Modal */}
            <SuggestionModal
              isOpen={showSuggestionModal}
              onClose={() => setShowSuggestionModal(false)}
              auth={auth}
            />
          </div>

          {/* Sliding Friends Sidebar - Only show if user is logged in */}
          {auth.user && (
            <FriendsSidebar
              auth={auth}
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          )}
        </div>
      </App>

      {/* Hero Screen Overlay - Positioned to cover main content but allow header/footer to show */}
      {showHeroScreen && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* Account for header (h-14 = 56px) and footer (~60px) */}
          <div className="absolute top-14 bottom-16 left-0 right-0 pointer-events-auto">
            <HeroScreen onComplete={handleHeroComplete} />
          </div>
        </div>
      )}
    </>
  );
}
