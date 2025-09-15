import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Lobby {
    id: number;
    lobby_code: string;
    game: { id: number; name: string; slug: string };
    host: { id: number; name: string };
    players: any[];
    started: boolean;
    [key: string]: any;
}

interface Message {
    id: number;
    message: string;
    user_id: number;
    user: { id: number; name: string };
    created_at: string;
}

declare global {
    interface Window {
        Echo: any;
        axios: any;
    }
}

export function useLobby(authUserId?: number) {
    const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentChannel, setCurrentChannel] = useState<any>(null);
    const [initializing, setInitializing] = useState(true);

    const leaveLobbyChannel = useCallback(() => {
        if (currentChannel && window.Echo) {
            console.log('Leaving channel:', currentChannel.name);
            window.Echo.leave(currentChannel.name);
            setCurrentChannel(null);
        }
    }, [currentChannel]);

    const joinLobbyChannel = useCallback((lobbyCode: string) => {
        if (!window.Echo || !lobbyCode) {
            console.log('Echo not available or no lobby code');
            return null;
        }

        // Leave existing channel first
        leaveLobbyChannel();

        try {
            const channelName = `lobby.${lobbyCode}`;
            console.log('Joining channel:', channelName);

            const channel = window.Echo.join(channelName)
                .here((users: any[]) => {
                    console.log('Users currently in channel:', users);
                    setOnlineUsers(users);
                    toast.info(`${users.length} players currently in lobby`);
                })
                .joining((user: any) => {
                    console.log('User joining:', user);
                    setOnlineUsers(prev => [...prev, user]);
                    toast.success(`${user.name} joined the lobby`, { icon: "👋" });
                })
                .leaving((user: any) => {
                    console.log('User leaving:', user);
                    setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
                    toast.warning(`${user.name} left the lobby`, { icon: "👋" });
                })
                .listen("LobbyMessageSent", (e: any) => {
                    console.log('LobbyMessageSent event received:', e);
                    handleNewMessage(e.message);
                })
                .listen("PlayerJoinedLobby", (e: any) => {
                    console.log('PlayerJoinedLobby event received:', e);
                    // Use the lobby code from the channel name instead of closure
                    const lobbyCode = channelName.replace('lobby.', '');
                    refreshLobby(lobbyCode);
                })
                .listen("PlayerLeftLobby", (e: any) => {
                    console.log('PlayerLeftLobby event received:', e);
                    // Use the lobby code from the channel name instead of closure
                    const lobbyCode = channelName.replace('lobby.', '');
                    refreshLobby(lobbyCode);
                })
                .listen("PlayerReadyStatusChanged", (e: any) => {
                    console.log('PlayerReadyStatusChanged event received:', e);
                    console.log('Event data:', { user: e.user, ready: e.ready });

                    // Update the specific player's ready status in current lobby
                    if (e.user && typeof e.ready !== 'undefined') {
                        setCurrentLobby(prevLobby => {
                            console.log('Previous lobby state:', prevLobby);
                            if (!prevLobby) return prevLobby;

                            const updatedPlayers = prevLobby.players.map(player => {
                                if (player.id === e.user.id) {
                                    console.log(`Updating player ${player.name} ready status from ${player.pivot?.ready} to ${e.ready}`);
                                    return {
                                        ...player,
                                        pivot: {
                                            ...player.pivot,
                                            ready: e.ready
                                        }
                                    };
                                }
                                return player;
                            });

                            const updatedLobby = {
                                ...prevLobby,
                                players: updatedPlayers
                            };

                            console.log('Updated lobby state:', updatedLobby);
                            return updatedLobby;
                        });

                        // Show toast for other users (not the one who changed status)
                        if (e.user.id !== authUserId) {
                            toast.info(`${e.user.name} is ${e.ready ? 'ready' : 'not ready'}`);
                        }
                    } else {
                        console.warn('PlayerReadyStatusChanged event missing required data:', e);
                    }
                })
                .listen("LobbyStarted", (e: any) => {
                    console.log('LobbyStarted event received:', e);
                    toast.success("Game is starting!", { icon: "🎮" });
                    // Update lobby state
                    if (currentLobby) {
                        setCurrentLobby(prev => prev ? { ...prev, started: true } : prev);
                    }
                });

            // Store channel reference with the name for easier debugging
            channel.name = channelName;
            setCurrentChannel(channel);

            console.log('Successfully joined channel:', channelName);
            return channel;
        } catch (error) {
            console.error("Error joining lobby channel:", error);
            toast.error("Failed to connect to lobby");
            return null;
        }
    }, [leaveLobbyChannel, currentLobby, authUserId]);

    const handleNewMessage = useCallback((message: Message) => {
        console.log('Handling new message:', message);
        setMessages((prev) => {
            // Remove any optimistic message with the same content and user
            const withoutOptimistic = prev.filter(m =>
                !(m.id.toString().startsWith(Date.now().toString().slice(0, -3)) &&
                    m.user_id === message.user_id &&
                    m.message === message.message)
            );

            const updated = [...withoutOptimistic, message];
            return updated.length > 100 ? updated.slice(-50) : updated;
        });

        if (message.user_id !== authUserId) {
            // Optional: play sound, show desktop notification, etc.
        }
    }, [authUserId]);

    const refreshLobby = async (lobbyCode: string) => {
        try {
            const res = await window.axios.get(`/api/lobbies/${lobbyCode}`);
            setCurrentLobby(res.data);
        } catch (error) {
            console.error("Failed to refresh lobby:", error);
        }
    };

    const loadMessages = async (lobbyCode: string) => {
        try {
            console.log('Loading messages for lobby:', lobbyCode);
            const res = await window.axios.get(`/api/lobbies/${lobbyCode}/messages`);
            console.log('Messages loaded:', res.data);
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to load messages:", error);
            toast.error("Failed to load chat messages");
            // Set empty messages array on error so chat still works
            setMessages([]);
        }
    };

    // Check for existing lobby on initialization
    const checkExistingLobby = useCallback(async () => {
        if (!authUserId) return;

        try {
            setInitializing(true);
            console.log('Checking for existing lobby...');

            // First try the dedicated endpoint for user's current lobby
            try {
                const userLobbyRes = await window.axios.get('/api/lobbies/current');
                const userLobby = userLobbyRes.data;

                if (userLobby) {
                    console.log('Found existing lobby via current endpoint:', userLobby.lobby_code);
                    setCurrentLobby(userLobby);

                    // Join the lobby channel and load messages
                    joinLobbyChannel(userLobby.lobby_code);
                    await loadMessages(userLobby.lobby_code);

                    toast.success(`Reconnected to lobby ${userLobby.lobby_code}`, { icon: "🔗" });
                    return;
                }
            } catch (currentError) {
                console.log('No current lobby found, trying fallback method');
            }

            // Fallback: Get all lobbies and find one the user is in
            const res = await window.axios.get('/api/lobbies');
            const responseData = res.data;

            // Handle both response formats
            const lobbies = Array.isArray(responseData) ? responseData :
                (responseData.lobbies ? responseData.lobbies : []);

            console.log('Lobbies response:', lobbies);

            if (!Array.isArray(lobbies)) {
                console.error('Lobbies is not an array:', lobbies);
                return;
            }

            // Find a lobby where the current user is a player
            const userLobby = lobbies.find((lobby: Lobby) =>
                Array.isArray(lobby.players) &&
                lobby.players.some(player => player.id === authUserId) &&
                !lobby.started
            );

            if (userLobby) {
                console.log('Found existing lobby:', userLobby.lobby_code);
                setCurrentLobby(userLobby);

                // Join the lobby channel and load messages
                joinLobbyChannel(userLobby.lobby_code);
                await loadMessages(userLobby.lobby_code);

                toast.success(`Reconnected to lobby ${userLobby.lobby_code}`, { icon: "🔗" });
            }
        } catch (error) {
            console.error('Failed to check existing lobby:', error);
            // Don't show error toast for this, it's just a check
        } finally {
            setInitializing(false);
        }
    }, [authUserId, joinLobbyChannel]);

    const sendMessage = async (msg: string) => {
        if (!currentLobby || !msg.trim()) return;

        console.log('Sending message to lobby:', currentLobby.lobby_code);

        // Create optimistic message with better ID generation
        const optimisticId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const optimisticMessage: Message = {
            id: optimisticId as any,
            message: msg.trim(),
            user_id: authUserId || 0,
            user: {
                id: authUserId || 0,
                name: "You" // Will be updated when real message comes back
            },
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            await window.axios.post(`/api/lobbies/${currentLobby.lobby_code}/messages`, {
                message: msg.trim()
            });
            console.log('Message sent successfully');
        } catch (error: any) {
            console.error("Failed to send message:", error);

            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));

            toast.error(error.response?.data?.message || "Failed to send message");
        }
    };

    const createLobby = async (gameId: number, password?: string) => {
        setLoading(true);
        const loadingToast = toast.loading("Creating lobby...");

        try {
            const res = await window.axios.post("/api/lobbies", {
                game_id: gameId,
                password: password || null
            });

            const lobby = res.data;
            setCurrentLobby(lobby);

            // Join the lobby channel using lobby code and load messages
            joinLobbyChannel(lobby.lobby_code);
            await loadMessages(lobby.lobby_code);

            toast.dismiss(loadingToast);
            toast.success("Lobby created!", { icon: "🎉" });

            return lobby;
        } catch (error: any) {
            console.error("Failed to create lobby:", error);
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || "Failed to create lobby");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const joinLobby = async (lobbyCode: string, password?: string) => {
        setLoading(true);
        const loadingToast = toast.loading("Joining lobby...");

        try {
            const res = await window.axios.post("/api/lobbies/join", {
                lobby_code: lobbyCode,
                password: password || null
            });

            const lobby = res.data;
            setCurrentLobby(lobby);

            // Join the lobby channel using lobby code and load messages
            joinLobbyChannel(lobby.lobby_code);
            await loadMessages(lobby.lobby_code);

            toast.dismiss(loadingToast);
            toast.success("Joined lobby!", { icon: "🎮" });

            return lobby;
        } catch (error: any) {
            console.error("Failed to join lobby:", error);
            toast.dismiss(loadingToast);
            const errorMessage = error.response?.data?.message || "Failed to join lobby";
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const leaveLobby = async () => {
        if (!currentLobby) return;

        try {
            await window.axios.post(`/api/lobbies/${currentLobby.lobby_code}/leave`);

            // Leave the channel and reset state
            leaveLobbyChannel();
            setCurrentLobby(null);
            setMessages([]);
            setOnlineUsers([]);

            toast.success("Left lobby");
        } catch (error: any) {
            console.error("Failed to leave lobby:", error);
            toast.error(error.response?.data?.message || "Failed to leave lobby");
        }
    };

    const findLobbyByCode = async (lobbyCode: string) => {
        try {
            const res = await window.axios.post("/api/lobbies/find", {
                lobby_code: lobbyCode
            });
            return res.data;
        } catch (error: any) {
            console.error("Failed to find lobby:", error);
            throw new Error(error.response?.data?.message || "Lobby not found");
        }
    };

    const toggleReady = async () => {
        if (!currentLobby || !authUserId) return;

        // Find current user in players list
        const currentPlayer = currentLobby.players.find(p => p.id === authUserId);
        if (!currentPlayer) return;

        const newReadyStatus = !currentPlayer.pivot?.ready;

        // Optimistic update - update ready status immediately
        setCurrentLobby(prevLobby => {
            if (!prevLobby) return prevLobby;

            const updatedPlayers = prevLobby.players.map(player => {
                if (player.id === authUserId) {
                    return {
                        ...player,
                        pivot: {
                            ...player.pivot,
                            ready: newReadyStatus
                        }
                    };
                }
                return player;
            });

            return {
                ...prevLobby,
                players: updatedPlayers
            };
        });

        // Show immediate feedback
        toast.success(newReadyStatus ? "You are ready!" : "You are not ready");

        try {
            const res = await window.axios.post(`/api/lobbies/${currentLobby.lobby_code}/ready`);
            console.log('Ready status updated successfully');

            // Verify the server response matches our optimistic update
            if (res.data.ready !== newReadyStatus) {
                console.warn('Server ready status differs from optimistic update');
                // Could refresh lobby here if needed
            }
        } catch (error: any) {
            console.error("Failed to toggle ready:", error);

            // Revert optimistic update on error
            setCurrentLobby(prevLobby => {
                if (!prevLobby) return prevLobby;

                const updatedPlayers = prevLobby.players.map(player => {
                    if (player.id === authUserId) {
                        return {
                            ...player,
                            pivot: {
                                ...player.pivot,
                                ready: !newReadyStatus // Revert
                            }
                        };
                    }
                    return player;
                });

                return {
                    ...prevLobby,
                    players: updatedPlayers
                };
            });

            toast.error(error.response?.data?.message || "Failed to update ready status");
        }
    };

    const startGame = async () => {
        if (!currentLobby) return;

        try {
            await window.axios.post(`/api/lobbies/${currentLobby.lobby_code}/start`);
            toast.success("Game starting!");
        } catch (error: any) {
            console.error("Failed to start game:", error);
            toast.error(error.response?.data?.message || "Failed to start game");
        }
    };

    // Initialize on mount
    useEffect(() => {
        if (authUserId && !currentLobby) {
            checkExistingLobby();
        } else if (!authUserId) {
            setInitializing(false);
        }
        // Only run on mount and when authUserId or currentLobby changes
    }, [authUserId]); // Remove checkExistingLobby from dependencies to prevent loops

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leaveLobbyChannel();
        };
    }, [leaveLobbyChannel]);

    // Debug: Log Echo availability
    useEffect(() => {
        console.log('Echo available:', !!window.Echo);
        if (window.Echo) {
            console.log('Echo connector:', window.Echo.connector);
        }
    }, []);

    return {
        currentLobby,
        onlineUsers,
        messages,
        loading: loading || initializing,
        createLobby,
        joinLobby,
        leaveLobby,
        sendMessage,
        findLobbyByCode,
        toggleReady,
        startGame,
        refreshLobby: (code: string) => refreshLobby(code),
    };
}
