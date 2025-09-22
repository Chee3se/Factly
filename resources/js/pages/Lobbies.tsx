import App from "@/layouts/App";
import { useLobby } from "@/hooks/useLobby";
import LobbyInterface from "@/components/LobbyInterface";

interface Props {
    auth: Auth;
}

export default function Lobbies({ auth }: Props) {
    const lobbyHook = useLobby(auth.user.id);

    return (
        <App title="Game Lobbies" auth={auth}>
            <div className="container mx-auto py-6 px-4 max-w-6xl">
                <LobbyInterface auth={auth} lobbyHook={lobbyHook} />
            </div>
        </App>
    );
}
