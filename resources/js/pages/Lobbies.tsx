import App from "@/layouts/App";
import { useLobby } from "@/hooks/useLobby";
import { useFriendsContext } from "@/contexts/FriendsContext";
import LobbyInterface from "@/components/Lobby/LobbyInterface";
import FriendsSidebar from "@/components/FriendsSidebar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface Props {
  auth: Auth;
  game?: {
    id: number;
    name: string;
    slug: string;
  };
}

function LobbiesContent({ auth, game }: Props) {
  const lobbyHook = useLobby(auth.user.id);
  const friendsHook = useFriendsContext();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleInviteFriend = (friendId: number) => {
    if (lobbyHook.currentLobby && friendsHook) {
      friendsHook.inviteFriendToLobby(
        friendId,
        lobbyHook.currentLobby.lobby_code,
      );
    }
  };

  return (
    <>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {lobbyHook.currentLobby && (
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setIsInviteOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite friends
            </Button>
          </div>
        )}
        <LobbyInterface auth={auth} lobbyHook={lobbyHook} game={game} />
      </div>

      {auth.user && lobbyHook.currentLobby && friendsHook && (
        <FriendsSidebar
          auth={auth}
          isOpen={isInviteOpen}
          onToggle={() => setIsInviteOpen(!isInviteOpen)}
          friendsHook={friendsHook}
          showInviteOptions
          showTab={false}
          onInviteFriend={handleInviteFriend}
          excludedFromInvite={
            lobbyHook.currentLobby?.players?.map((p: any) => p.id) || []
          }
        />
      )}
    </>
  );
}

export default function Lobbies({ auth, game }: Props) {
  return (
    <App title={game ? `${game.name} Lobbies` : "Game Lobbies"} auth={auth}>
      <div className="relative">
        <LobbiesContent auth={auth} game={game} />
      </div>
    </App>
  );
}
