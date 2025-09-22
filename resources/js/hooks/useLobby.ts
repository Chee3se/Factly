import { User } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface WhisperHandlers {
    [event: string]: (data: any) => void;
}

export function useLobby(authUserId?: number) {
    const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentChannel, setCurrentChannel] = useState<any>(null);
    const [initializing, setInitializing] = useState(true);
    const [whisperHandlers, setWhisperHandlers] = useState<WhisperHandlers>({});

    const channelRef = useRef<any>(null);
    const initializingRef = useRef(false);

    const leaveLobbyChannel = useCallback(() => {
        if (channelRef.current && window.Echo) {
            try {
                window.Echo.leave(channelRef.current.name);
            } catch (error) {
                // Silent fail
            }
            channelRef.current = null;
            setCurrentChannel(null);
            setWhisperHandlers({});
        }
    }, []);

    const refreshLobby = useCallback(async (lobbyCode: string) => {
        try {
            const res = await (window as any).axios.get(`/api/lobbies/${lobbyCode}`);
            setCurrentLobby(res.data);
        } catch (error) {
            // Silent fail
        }
    }, []);

    const handleNewMessage = useCallback((message: Message) => {
        if (message.user_id === authUserId) {
            setMessages(prev => {
                const withoutOptimistic = prev.filter(m =>
                    !(typeof m.id === "string" && m.user_id === authUserId && m.message === message.message)
                );
                return [...withoutOptimistic, message];
            });
            return;
        }

        setMessages(prev => {
            const updated = [...prev, message];
            return updated.length > 100 ? updated.slice(-50) : updated;
        });
    }, [authUserId]);

    const joinLobbyChannel = useCallback((lobbyCode: string) => {
        if (!window.Echo || !lobbyCode) {
            return null;
        }

        // Don't rejoin if we're already in the same channel
        if (channelRef.current && channelRef.current.name === `lobby.${lobbyCode}`) {
            return channelRef.current;
        }

        leaveLobbyChannel();

        try {
            const channelName = `lobby.${lobbyCode}`;

            const channel = window.Echo.join(channelName)
                .here((users: any[]) => {
                    setOnlineUsers(users);
                    setTimeout(() => {
                        channel.isReady = true;
                        channelRef.current = channel;
                        setCurrentChannel(channel);
                    }, 100);
                })
                .joining((user: any) => {
                    setOnlineUsers(prev => [...prev, user]);
                    toast.success(`${user.name} joined the lobby`, { icon: "👋" });
                })
                .leaving((user: any) => {
                    setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
                    toast.warning(`${user.name} left the lobby`, { icon: "👋" });
                })
                .error((error: any) => {
                    toast.error("Connection error - please refresh");
                })
                .listen("LobbyMessageSent", (e: any) => {
                    handleNewMessage(e.message);
                })
                .listen("PlayerJoinedLobby", (e: any) => {
                    refreshLobby(lobbyCode);
                })
                .listen("PlayerLeftLobby", (e: any) => {
                    refreshLobby(lobbyCode);
                })
                .listen("LobbyStarted", (e: any) => {
                    const lobbyData = e.lobby;

                    if (!lobbyData || !lobbyData.id) {
                        return;
                    }

                    toast.success("Game is starting!", { icon: "🎮" });

                    setCurrentLobby(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            started: true,
                            ...lobbyData
                        };
                    });

                    const gameSlug = lobbyData?.game?.slug;

                    if (gameSlug) {
                        const gameUrl = `/games/${gameSlug}`;
                        setTimeout(() => {
                            leaveLobbyChannel();
                            window.location.replace(gameUrl);
                        }, 1000);
                    } else {
                        toast.error('Game data missing - please refresh and try again');
                    }
                })
                .listen("PlayerReadyStatusChanged", (e: any) => {
                    if (e.user && typeof e.ready !== 'undefined') {
                        setCurrentLobby(prevLobby => {
                            if (!prevLobby) return prevLobby;

                            const updatedPlayers = prevLobby.players.map((player: LobbyPlayer) => {
                                if (player.id === e.user.id) {
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

                            return {
                                ...prevLobby,
                                players: updatedPlayers
                            };
                        });

                        if (e.user.id !== authUserId) {
                            toast.info(`${e.user.name} is ${e.ready ? 'ready' : 'not ready'}`);
                        }
                    }
                });

            channel.name = channelName;
            return channel;
        } catch (error) {
            toast.error("Failed to connect to lobby");
            return null;
        }
    }, [leaveLobbyChannel, authUserId, handleNewMessage, refreshLobby]);

    const loadMessages = useCallback(async (lobbyCode: string) => {
        try {
            const res = await (window as any).axios.get(`/api/lobbies/${lobbyCode}/messages`);
            setMessages(res.data);
        } catch (error) {
            toast.error("Failed to load chat messages");
            setMessages([]);
        }
    }, []);

    const checkExistingLobby = useCallback(async () => {
        if (!authUserId || initializingRef.current) return;

        initializingRef.current = true;
        setInitializing(true);

        try {
            // First try to get current lobby
            try {
                const userLobbyRes = await (window as any).axios.get('/api/lobbies/current');
                const userLobby = userLobbyRes.data;

                if (userLobby) {
                    setCurrentLobby(userLobby);
                    joinLobbyChannel(userLobby.lobby_code);
                    await loadMessages(userLobby.lobby_code);

                    const toastMessage = userLobby.started
                        ? `Reconnected to active game lobby ${userLobby.lobby_code}`
                        : `Reconnected to lobby ${userLobby.lobby_code}`;
                    toast.success(toastMessage, { icon: "🔗" });
                    return;
                }
            } catch (currentError) {
                // Continue to fallback
            }

            // Fallback: search all lobbies
            const res = await (window as any).axios.get('/api/lobbies');
            const responseData = res.data;

            const lobbies = Array.isArray(responseData) ? responseData :
                (responseData.lobbies ? responseData.lobbies : []);

            if (!Array.isArray(lobbies)) {
                return;
            }

            const userLobby = lobbies.find((lobby: Lobby) =>
                Array.isArray(lobby.players) &&
                lobby.players.some((player: LobbyPlayer) => player.id === authUserId)
            );

            if (userLobby) {
                setCurrentLobby(userLobby);
                joinLobbyChannel(userLobby.lobby_code);
                await loadMessages(userLobby.lobby_code);

                const toastMessage = userLobby.started
                    ? `Reconnected to active game lobby ${userLobby.lobby_code}`
                    : `Reconnected to lobby ${userLobby.lobby_code}`;
                toast.success(toastMessage, { icon: "🔗" });
            }
        } catch (error) {
            // Silent fail
        } finally {
            setInitializing(false);
            initializingRef.current = false;
        }
    }, [authUserId, joinLobbyChannel, loadMessages]);

    const sendMessage = useCallback(async (msg: string, user: User) => {
        if (!currentLobby || !msg.trim()) return;

        const optimisticId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const optimisticMessage: Message = {
            id: optimisticId,
            message: msg.trim(),
            user_id: authUserId || 0,
            user: {
                id: authUserId || 0,
                name: user.name,
                avatar: user.avatar
            },
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            await (window as any).axios.post(`/api/lobbies/${currentLobby.lobby_code}/messages`, {
                message: msg.trim()
            });
        } catch (error: any) {
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    }, [currentLobby, authUserId]);

    const createLobby = useCallback(async (gameId: number, password?: string) => {
        setLoading(true);
        const loadingToast = toast.loading("Creating lobby...");

        try {
            const res = await (window as any).axios.post("/api/lobbies", {
                game_id: gameId,
                password: password || null
            });

            const lobby = res.data;
            setCurrentLobby(lobby);

            joinLobbyChannel(lobby.lobby_code);
            await loadMessages(lobby.lobby_code);

            toast.dismiss(loadingToast);
            toast.success("Lobby created!", { icon: "🎉" });

            return lobby;
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || "Failed to create lobby");
            throw error;
        } finally {
            setLoading(false);
        }
    }, [joinLobbyChannel, loadMessages]);

    const joinLobby = useCallback(async (lobbyCode: string, password?: string) => {
        setLoading(true);
        const loadingToast = toast.loading("Joining lobby...");

        try {
            const res = await (window as any).axios.post("/api/lobbies/join", {
                lobby_code: lobbyCode,
                password: password || null
            });

            const lobby = res.data;
            setCurrentLobby(lobby);

            joinLobbyChannel(lobby.lobby_code);
            await loadMessages(lobby.lobby_code);

            toast.dismiss(loadingToast);
            toast.success("Joined lobby!", { icon: "🎮" });

            return lobby;
        } catch (error: any) {
            toast.dismiss(loadingToast);
            const errorMessage = error.response?.data?.message || "Failed to join lobby";
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [joinLobbyChannel, loadMessages]);

    const leaveLobby = useCallback(async () => {
        if (!currentLobby) return;

        try {
            await (window as any).axios.post(`/api/lobbies/${currentLobby.lobby_code}/leave`);

            leaveLobbyChannel();
            setCurrentLobby(null);
            setMessages([]);
            setOnlineUsers([]);

            toast.success("Left lobby");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to leave lobby");
        }
    }, [currentLobby, leaveLobbyChannel]);

    const findLobbyByCode = useCallback(async (lobbyCode: string) => {
        try {
            const res = await (window as any).axios.post("/api/lobbies/find", {
                lobby_code: lobbyCode
            });
            return res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Lobby not found");
        }
    }, []);

    const toggleReady = useCallback(async () => {
        if (!currentLobby || !authUserId) return;

        const currentPlayer = currentLobby.players.find((p: LobbyPlayer) => p.id === authUserId);
        if (!currentPlayer) return;

        const newReadyStatus = !currentPlayer.pivot?.ready;

        // Optimistic update
        setCurrentLobby(prevLobby => {
            if (!prevLobby) return prevLobby;

            const updatedPlayers = prevLobby.players.map((player: LobbyPlayer) => {
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

        toast.success(newReadyStatus ? "You are ready!" : "You are not ready");

        try {
            const res = await (window as any).axios.post(`/api/lobbies/${currentLobby.lobby_code}/ready`);

            if (res.data.ready !== newReadyStatus) {
                // Server state mismatch, revert optimistic update
                setCurrentLobby(prevLobby => {
                    if (!prevLobby) return prevLobby;

                    const updatedPlayers = prevLobby.players.map((player: LobbyPlayer) => {
                        if (player.id === authUserId) {
                            return {
                                ...player,
                                pivot: {
                                    ...player.pivot,
                                    ready: res.data.ready
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
            }
        } catch (error: any) {
            // Revert optimistic update on error
            setCurrentLobby(prevLobby => {
                if (!prevLobby) return prevLobby;

                const updatedPlayers = prevLobby.players.map((player: LobbyPlayer) => {
                    if (player.id === authUserId) {
                        return {
                            ...player,
                            pivot: {
                                ...player.pivot,
                                ready: !newReadyStatus
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
    }, [currentLobby, authUserId]);

    const startGame = useCallback(async () => {
        if (!currentLobby) return;

        try {
            const response = await (window as any).axios.post(`/api/lobbies/${currentLobby.lobby_code}/start`);
            toast.success(response.data.message || "Game starting!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to start game");
        }
    }, [currentLobby]);

    const onWhisper = useCallback((event: string, handler: (data: any) => void) => {
        if (!channelRef.current || !channelRef.current.isReady) return;

        try {
            channelRef.current.listenForWhisper(event, handler);
            setWhisperHandlers(prev => ({ ...prev, [event]: handler }));
        } catch (error) {
            // Silent fail
        }
    }, []);

    const sendWhisper = useCallback((event: string, data: any) => {
        if (!channelRef.current || !channelRef.current.isReady) return;

        try {
            const actualChannelName = `presence-${channelRef.current.name}`;
            const pusherChannel = (window as any).Echo?.connector?.pusher?.channels?.channels?.[actualChannelName];

            if (pusherChannel && pusherChannel.trigger) {
                pusherChannel.trigger(`client-${event}`, data);
            } else {
                channelRef.current.whisper(event, data);
            }
        } catch (error) {
            // Silent fail
        }
    }, []);

    const offWhisper = useCallback((event: string) => {
        if (!channelRef.current || !whisperHandlers[event]) return;

        try {
            channelRef.current.stopListeningForWhisper(event, whisperHandlers[event]);
            setWhisperHandlers(prev => {
                const newHandlers = { ...prev };
                delete newHandlers[event];
                return newHandlers;
            });
        } catch (error) {
            // Silent fail
        }
    }, [whisperHandlers]);

    // Initialize on mount if user is authenticated
    useEffect(() => {
        if (authUserId && !currentLobby && !initializingRef.current) {
            checkExistingLobby();
        } else if (!authUserId) {
            setInitializing(false);
        }
    }, [authUserId, currentLobby]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leaveLobbyChannel();
        };
    }, [leaveLobbyChannel]);

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
        refreshLobby,
        currentChannel,
        onWhisper,
        sendWhisper,
        offWhisper
    };
}
