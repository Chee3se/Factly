import { createContext, useContext } from "react";

export interface ActiveLobbyInfo {
  lobby_code: string;
  players?: Array<{ id: number }>;
}

interface LobbyContextValue {
  activeLobby: ActiveLobbyInfo | null;
  setActiveLobby: (lobby: ActiveLobbyInfo | null) => void;
}

export const LobbyContext = createContext<LobbyContextValue>({
  activeLobby: null,
  setActiveLobby: () => {},
});

export function useLobbyContext() {
  return useContext(LobbyContext);
}
