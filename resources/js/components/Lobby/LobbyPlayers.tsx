import { useLobby } from "@/hooks/useLobby";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Crown, UserCheck, UserX } from "lucide-react";

export default function LobbyPlayers({
                                         auth,
                                         lobbyHook,
                                         showReadyToggle = true,
                                         isDarkTheme = false,
                                         isCompact = false
                                     }: {
    auth: Auth;
    lobbyHook: ReturnType<typeof useLobby>;
    showReadyToggle?: boolean;
    isDarkTheme?: boolean;
    isCompact?: boolean;
}) {
    const { currentLobby, onlineUsers, toggleReady } = lobbyHook;

    if (!currentLobby) {
        return (
            <div className={`text-center py-8 ${
                isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'
            }`}>
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

    // Theme-aware classes
    const getThemeClasses = () => {
        if (isDarkTheme) {
            return {
                text: 'text-white',
                mutedText: 'text-gray-300',
                cardBg: 'bg-white/10 border-white/20',
                currentUserBg: 'bg-blue-500/20 border-blue-400/40',
                hoverBg: 'hover:bg-white/5',
                readyBadge: 'bg-green-500/20 text-green-300 border-green-400/40',
                notReadyBadge: 'bg-gray-500/20 text-gray-300 border-gray-400/40',
                hostBadge: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
                youBadge: 'bg-blue-500/20 text-blue-300 border-blue-400/40'
            };
        }
        return {
            text: 'text-foreground',
            mutedText: 'text-muted-foreground',
            cardBg: 'bg-card border-border',
            currentUserBg: 'bg-blue-50 border-blue-200',
            hoverBg: 'hover:bg-muted/50',
            readyBadge: 'bg-green-100 text-green-800 border-green-200',
            notReadyBadge: 'bg-gray-100 text-gray-600 border-gray-200',
            hostBadge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            youBadge: 'bg-blue-100 text-blue-800 border-blue-200'
        };
    };

    const theme = getThemeClasses();
    const avatarSize = isCompact ? 'h-8 w-8' : 'h-10 w-10';
    const padding = isCompact ? 'p-2' : 'p-3';
    const spacing = isCompact ? 'space-y-2' : 'space-y-3';
    const textSize = isCompact ? 'text-sm' : '';

    return (
        <div className={spacing}>
            {/* Ready Toggle for Current User */}
            {showReadyToggle && currentUserPlayer && (
                <div className="pb-4 border-b border-white/20">
                    <Button
                        onClick={handleReadyToggle}
                        className={`w-full ${
                            isCurrentUserReady
                                ? isDarkTheme
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/50'
                                    : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-200'
                                : isDarkTheme
                                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/50'
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
            <div className={spacing}>
                {currentLobby.players?.length === 0 ? (
                    <div className={`text-center py-4 ${theme.mutedText}`}>
                        No players in lobby
                    </div>
                ) : (
                    currentLobby.players?.map((player: Player) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between ${padding} rounded-lg border transition-colors ${
                                isCurrentUser(player.id)
                                    ? theme.currentUserBg
                                    : `${theme.cardBg} ${theme.hoverBg}`
                            }`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Online status dot */}
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    isPlayerOnline(player.id)
                                        ? 'bg-green-500'
                                        : 'bg-gray-400'
                                }`} />

                                {/* Player Avatar */}
                                <Avatar className={`${avatarSize} flex-shrink-0`}>
                                    <AvatarImage src={getAvatarUrl(player.avatar) || undefined} alt={player.name} />
                                    <AvatarFallback className={isDarkTheme ? 'bg-white/20 text-white' : ''}>
                                        {player.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Player Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-medium truncate ${theme.text} ${textSize}`}>
                                            {player.name}
                                        </span>

                                        {isHost(player.id) && (
                                            <Badge variant="secondary" className={`text-xs ${theme.hostBadge} ${isCompact ? 'px-1.5 py-0.5' : ''}`}>
                                                <Crown className={`${isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} mr-1`} />
                                                Host
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ready Status - Only show if showReadyToggle is true */}
                            {showReadyToggle && (
                                <div className="flex items-center flex-shrink-0">
                                    {player.pivot?.ready ? (
                                        <Badge className={`${theme.readyBadge} hover:${theme.readyBadge} ${isCompact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                                            <CheckCircle className={`${isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} mr-1`} />
                                            {isCompact ? 'Ready' : 'Ready'}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className={`${theme.notReadyBadge} ${isCompact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                                            <XCircle className={`${isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} mr-1`} />
                                            {isCompact ? 'Not Ready' : 'Not Ready'}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
