import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, X, Check } from "lucide-react";

interface Props {
  lobbyInvitation: {
    inviter: { id: number; name: string; avatar?: string };
    lobby_code: string;
    game_name: string;
    message: string;
  } | null;
  onAccept: (lobbyCode: string) => Promise<void>;
  onDecline: () => void;
  loading?: boolean;
}

export default function LobbyInvitationModal({
  lobbyInvitation,
  onAccept,
  onDecline,
  loading = false,
}: Props) {
  const getInitials = (name: string): string => {
    if (!name) return "??";
    return (
      name
        .split(" ")
        .map((word) => word?.[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  };

  const getAvatarUrl = (avatar?: string): string | undefined => {
    if (!avatar) return undefined;
    return `/storage/${avatar}`;
  };

  if (!lobbyInvitation) return null;

  return (
    <Dialog open={!!lobbyInvitation} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <DialogTitle>Lobby Invitation</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={getAvatarUrl(lobbyInvitation.inviter.avatar)}
              alt={lobbyInvitation.inviter.name}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(lobbyInvitation.inviter.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">
              <span className="font-bold text-foreground">
                {lobbyInvitation.inviter.name}
              </span>{" "}
              invited you to join their lobby
            </p>
            <div className="space-y-1 mt-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Game:</span>{" "}
                {lobbyInvitation.game_name}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Lobby Code:</span>{" "}
                {lobbyInvitation.lobby_code}
              </p>
            </div>
          </div>
        </div>

        <DialogDescription>
          Would you like to join this lobby? You'll be taken to the lobby page
          if you accept.
        </DialogDescription>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Decline
          </Button>
          <Button
            onClick={() => onAccept(lobbyInvitation.lobby_code)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            {loading ? "Joining..." : "Join Lobby"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
