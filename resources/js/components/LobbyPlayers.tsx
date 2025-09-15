import { useLobby } from "@/hooks/useLobby";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Crown, UserCheck, UserX } from "lucide-react";

export default function LobbyPlayers({
                                         auth,
                                         lobbyHook
                                     }: {
    auth: Auth;
    lobbyHook: ReturnType<typeof useLobby>;
}) {
    const { currentLobby, onlineUsers, toggleReady } = lobbyHook;

    if (!currentLobby) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Join a lobby to see players
            </div>
        );
    }

    const isHost = (playerId: number) => currentLobby.host?.id === playerId;
    const isCurrentUser = (playerId: number) => auth.user?.id === playerId;
    const isPlayerOnline = (playerId: number) => onlineUsers.some(u => u.id === playerId);

    const handleReadyToggle = () => {
        toggleReady();
    };

    const getAvatarUrl = (avatar?: string): string | null => {
        if (!avatar) return null;
        return `/storage/${avatar}`;
    };

    const currentUserPlayer = currentLobby.players?.find(p => p.id === auth.user?.id);
    const isCurrentUserReady = currentUserPlayer?.pivot?.ready || false;

    return (
        <div className="space-y-4">
            {/* Ready Toggle for Current User */}
            {currentUserPlayer && (
                <div className="pb-4 border-b">
                    <Button
                        onClick={handleReadyToggle}
                        className={`w-full ${
                            isCurrentUserReady
                                ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-200'
                                : 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-200'
                        }`}
                        variant="outline"
                    >
                        {isCurrentUserReady ? (
                            <>
                                <UserX className="h-4 w-4 mr-2" />
                                Mark Not Ready
                            </>
                        ) : (
                            <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Mark Ready
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Players List */}
            <div className="space-y-3">
                {currentLobby.players?.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                        No players in lobby
                    </div>
                ) : (
                    currentLobby.players?.map((player: Player) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                isCurrentUser(player.id)
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-card border-border hover:bg-muted/50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Online status dot */}
                                <div className={`w-2 h-2 rounded-full ${
                                    isPlayerOnline(player.id)
                                        ? 'bg-green-500'
                                        : 'bg-gray-400'
                                }`} />

                                {/* Player Avatar */}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={getAvatarUrl(auth.user.avatar) || undefined} alt={auth.user.name} />
                                    <AvatarFallback>
                                        {player.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Player Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {player.name}
                                        </span>

                                        {isHost(player.id) && (
                                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                                <Crown className="h-3 w-3 mr-1" />
                                                Host
                                            </Badge>
                                        )}

                                        {isCurrentUser(player.id) && (
                                            <Badge variant="outline" className="text-xs">
                                                You
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ready Status */}
                            <div className="flex items-center">
                                {player.pivot?.ready ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Ready
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Not Ready
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
