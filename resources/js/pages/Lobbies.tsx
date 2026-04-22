import App from "@/layouts/App";
import { useLobby } from "@/hooks/useLobby";
import { useLobbyContext } from "@/contexts/LobbyContext";
import LobbyInterface from "@/components/Lobby/LobbyInterface";
import { useEffect } from "react";

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
  const { setActiveLobby } = useLobbyContext();

  useEffect(() => {
    if (lobbyHook.currentLobby?.lobby_code) {
      setActiveLobby({
        lobby_code: lobbyHook.currentLobby.lobby_code,
        players: lobbyHook.currentLobby.players?.map((p: any) => ({ id: p.id })),
      });
    } else {
      setActiveLobby(null);
    }
    return () => setActiveLobby(null);
  }, [
    lobbyHook.currentLobby?.lobby_code,
    lobbyHook.currentLobby?.players,
    setActiveLobby,
  ]);

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <LobbyInterface auth={auth} lobbyHook={lobbyHook} game={game} />
    </div>
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
