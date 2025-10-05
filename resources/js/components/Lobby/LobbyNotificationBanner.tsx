import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { X, Users } from "lucide-react";

interface Lobby {
  id: number;
  lobby_code: string;
  game?: {
    name: string;
    slug: string;
  };
}

interface LobbyNotificationBannerProps {
  currentLobby: Lobby | null;
}

export default function LobbyNotificationBanner({
  currentLobby,
}: LobbyNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!currentLobby || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                You're in a lobby!
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{currentLobby.lobby_code}</span> •{" "}
                {currentLobby.game?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="default">
              <Link href={`/games/${currentLobby.game?.slug}`}>Reconnect</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
