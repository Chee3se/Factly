import App from "@/layouts/App";
import { useLobby } from "@/hooks/useLobby";
import { useFriends } from "@/hooks/useFriends";
import LobbyInterface from "@/components/LobbyInterface";
import FriendsSidebar from "@/components/FriendsSidebar";
import { useState } from "react";

interface Props {
    auth: Auth;
    game?: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function Lobbies({ auth, game }: Props) {
    const lobbyHook = useLobby(auth.user.id);
    const friendsHook = useFriends(auth.user.id);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleInviteFriend = (friendId: number) => {
        if (lobbyHook.currentLobby) {
            friendsHook.inviteFriendToLobby(friendId, lobbyHook.currentLobby.lobby_code);
        }
    };

    return (
        <App title={game ? `${game.name} Lobbies` : "Game Lobbies"} auth={auth}>
            <div className="relative">
                <div className="container mx-auto py-6 px-4 max-w-6xl">
                    <LobbyInterface
                        auth={auth}
                        lobbyHook={lobbyHook}
                        game={game}
                    />
                </div>

                {/* Friends Sidebar - Only show if user is logged in */}
                {auth.user && (
                    <FriendsSidebar
                        auth={{
                            user: auth.user,
                            ...friendsHook
                        }}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        showInviteOptions={!!lobbyHook.currentLobby}
                        onInviteFriend={handleInviteFriend}
                    />
                )}
            </div>
        </App>
    );
}
