import LobbyChat from "@/components/LobbyChat";
import LobbyPlayers from "@/components/LobbyPlayers";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Users,
    MessageSquare,
    Copy,
    Crown,
    Play,
    LogOut,
    Hash,
    CheckCircle,
    Trash2,
} from "lucide-react";

interface Props {
    auth: Auth;
    lobbyHook: any;
}

export default function LobbyInterface({ auth, lobbyHook }: Props) {
    const [lobbyCode, setLobbyCode] = useState("");
    const [selectedGameId, setSelectedGameId] = useState(2);

    const handleCreateLobby = () => {
        lobbyHook.createLobby(selectedGameId);
    };

    const handleJoinLobby = () => {
        if (lobbyCode.trim()) {
            lobbyHook.joinLobby(lobbyCode.trim().toUpperCase());
        }
    };

    const handleLeaveLobby = () => {
        if (lobbyHook.currentLobby) {
            lobbyHook.leaveLobby();
        }
    };

    const handleStartGame = () => {
        if (lobbyHook.currentLobby) {
            lobbyHook.startGame();
        }
    };

    const copyLobbyCode = async () => {
        if (lobbyHook.currentLobby?.lobby_code) {
            try {
                await navigator.clipboard.writeText(lobbyHook.currentLobby.lobby_code);
                toast.success("Lobby code copied to clipboard!");
            } catch (error) {
                toast.error("Failed to copy lobby code");
            }
        }
    };

    const isHost = lobbyHook.currentLobby?.host?.id === auth.user.id;
    const allPlayersReady = lobbyHook.currentLobby?.players?.every(player => player.pivot?.ready);
    const canStartGame = isHost && allPlayersReady && (lobbyHook.currentLobby?.players?.length || 0) >= 1;
    const readyCount = lobbyHook.currentLobby?.players?.filter(p => p.pivot?.ready).length || 0;
    const totalPlayers = lobbyHook.currentLobby?.players?.length || 0;
    const isOnlyPlayer = totalPlayers === 1 && isHost;

    const handleDeleteLobby = () => {
        if (isOnlyPlayer) {
            handleLeaveLobby(); // This will delete the lobby since host is leaving and no other players
        }
    };

    return (
        <>
            {!lobbyHook.currentLobby ? (
                /* Join/Create Lobby Section */
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Join a Game</CardTitle>
                            <CardDescription>
                                Enter a lobby code to join or create a new lobby
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Join Lobby Section */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lobbyCode" className="flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        Lobby Code
                                    </Label>
                                    <Input
                                        id="lobbyCode"
                                        type="text"
                                        value={lobbyCode}
                                        onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                                        placeholder="XXXXXXXX"
                                        className="text-center text-lg font-mono tracking-wider"
                                        onKeyPress={(e) => e.key === 'Enter' && handleJoinLobby()}
                                        disabled={lobbyHook.loading}
                                        maxLength={8}
                                    />
                                </div>
                                <Button
                                    onClick={handleJoinLobby}
                                    disabled={!lobbyCode.trim() || lobbyHook.loading}
                                    className="w-full"
                                    size="lg"
                                >
                                    {lobbyHook.loading ? 'Joining...' : 'Join Lobby'}
                                </Button>
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">or</span>
                                </div>
                            </div>

                            {/* Create Lobby Section */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gameSelect">Select Game</Label>
                                    <select
                                        id="gameSelect"
                                        value={selectedGameId}
                                        onChange={(e) => setSelectedGameId(Number(e.target.value))}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value={2}>Quiz Ladder</option>
                                        {/* Add more games as needed */}
                                    </select>
                                </div>
                                <Button
                                    onClick={handleCreateLobby}
                                    disabled={lobbyHook.loading}
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                >
                                    {lobbyHook.loading ? 'Creating...' : 'Create New Lobby'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Lobby Interface */
                <div className="space-y-6">
                    {/* Lobby Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-2xl">
                                            {lobbyHook.currentLobby.game?.name || "Game Lobby"}
                                        </CardTitle>
                                        <Badge variant={lobbyHook.currentLobby.started ? "default" : "secondary"}>
                                            {lobbyHook.currentLobby.started ? 'In Progress' : 'Waiting'}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        {/* Lobby Code - Click to Copy */}
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <Button
                                                variant="ghost"
                                                onClick={copyLobbyCode}
                                                className="font-mono font-bold text-lg text-primary hover:bg-primary/10 p-2 h-auto"
                                            >
                                                {lobbyHook.currentLobby.lobby_code}
                                                <Copy className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isHost && !lobbyHook.currentLobby.started && (
                                        <Button
                                            onClick={handleStartGame}
                                            disabled={!canStartGame || lobbyHook.loading}
                                            className="flex items-center gap-2"
                                        >
                                            <Play className="h-4 w-4" />
                                            {lobbyHook.loading ? 'Starting...' : 'Start Game'}
                                        </Button>
                                    )}

                                    {isOnlyPlayer ? (
                                        <Button
                                            onClick={handleDeleteLobby}
                                            disabled={lobbyHook.loading}
                                            variant="destructive"
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Lobby
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleLeaveLobby}
                                            disabled={lobbyHook.loading}
                                            variant="destructive"
                                            className="flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Leave
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Main Lobby Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Players Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Players
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LobbyPlayers
                                    auth={auth}
                                    lobbyHook={lobbyHook}
                                    showReadyToggle={true}
                                    isDarkTheme={false}
                                    isCompact={false}
                                />
                            </CardContent>
                        </Card>

                        {/* Chat Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Chat
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LobbyChat
                                    auth={auth}
                                    lobbyHook={lobbyHook}
                                    isDarkTheme={false}
                                    isCompact={false}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
}
