import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gamepad2, X, Check } from "lucide-react";

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
        className="sm:max-w-md p-0 overflow-hidden border-border/60"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Lobby invitation</DialogTitle>

        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Gamepad2 className="h-4 w-4" />
            Lobby invite
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/30 shadow-md">
              <AvatarImage
                src={getAvatarUrl(lobbyInvitation.inviter.avatar)}
                alt={lobbyInvitation.inviter.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(lobbyInvitation.inviter.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-base truncate">
                {lobbyInvitation.inviter.name}
              </p>
              <p className="text-sm text-muted-foreground">
                wants you to join their game
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-2 border-t border-border/60">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Game</span>
            <span className="font-medium">{lobbyInvitation.game_name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Lobby code</span>
            <span className="font-mono font-semibold tracking-widest">
              {lobbyInvitation.lobby_code}
            </span>
          </div>
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-1">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={loading}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1.5" />
            Decline
          </Button>
          <Button
            onClick={() => onAccept(lobbyInvitation.lobby_code)}
            disabled={loading}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1.5" />
            {loading ? "Joining..." : "Join"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
