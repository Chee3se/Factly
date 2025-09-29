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
  const isJoiningRef = useRef(false);
  const currentLobbyRef = useRef<Lobby | null>(null);

  useEffect(() => {
    currentLobbyRef.current = currentLobby;
  }, [currentLobby]);

  const leaveLobbyChannel = useCallback(() => {
    if (channelRef.current && window.Echo) {
      try {
        console.log("Leaving channel:", channelRef.current.name);
        window.Echo.leave(channelRef.current.name);
      } catch (error) {
        console.warn("Error leaving channel:", error);
      }
      channelRef.current = null;
      setCurrentChannel(null);
      setWhisperHandlers({});
    }
  }, []);

  const refreshLobby = useCallback(async (lobbyCode: string) => {
    if (!lobbyCode) return;
    try {
      console.log("Refreshing lobby:", lobbyCode);
      const res = await (window as any).axios.get(`/api/lobbies/${lobbyCode}`);

      console.log("Refreshed lobby data:", res.data);

      setCurrentLobby((prevLobby) => {
        if (res.data && res.data.lobby_code === lobbyCode) {
          console.log("Updating lobby state with fresh data");
          return {
            ...prevLobby,
            ...res.data,
          };
        }
        console.log("No valid lobby data received, keeping current state");
        return prevLobby;
      });
    } catch (error) {
      console.error("Failed to refresh lobby:", error);
    }
  }, []);

  const handleNewMessage = useCallback(
    (message: Message) => {
      if (message.user_id === authUserId) {
        setMessages((prev) => {
          const withoutOptimistic = prev.filter(
            (m) =>
              !(
                typeof m.id === "string" &&
                m.user_id === authUserId &&
                m.message === message.message
              ),
          );
          return [...withoutOptimistic, message];
        });
        return;
      }

      setMessages((prev) => {
        const updated = [...prev, message];
        return updated.length > 100 ? updated.slice(-50) : updated;
      });
    },
    [authUserId],
  );

  const loadMessages = useCallback(async (lobbyCode: string) => {
    if (!lobbyCode) {
      console.error("Cannot load messages: lobbyCode is undefined");
      setMessages([]);
      return;
    }

    try {
      console.log("Loading messages for lobby:", lobbyCode);
      const res = await (window as any).axios.get(
        `/api/lobbies/${lobbyCode}/messages`,
      );
      setMessages(res.data || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load chat messages");
      setMessages([]);
    }
  }, []);

  const joinLobbyChannel = useCallback(
    (lobbyCode: string) => {
      if (!window.Echo || !lobbyCode || isJoiningRef.current) {
        console.log("Cannot join channel - Echo not ready or already joining");
        return null;
      }

      if (
        channelRef.current &&
        channelRef.current.name === `lobby.${lobbyCode}`
      ) {
        console.log("Already in channel:", channelRef.current.name);
        return channelRef.current;
      }

      isJoiningRef.current = true;
      leaveLobbyChannel();

      try {
        const channelName = `lobby.${lobbyCode}`;
        console.log("Joining channel:", channelName);

        const channel = window.Echo.join(channelName)
          .here((users: any[]) => {
            console.log("Channel here - users:", users);
            setOnlineUsers(users || []);
          })
          .joining((user: any) => {
            console.log("User joining:", user);
            setOnlineUsers((prev) => {
              if (prev.find((u) => u.id === user.id)) {
                return prev;
              }
              return [...prev, user];
            });
            toast.success(`${user.name} joined the lobby`, { icon: "👋" });
          })
          .leaving((user: any) => {
            console.log("User leaving:", user);
            setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
            toast.warning(`${user.name} left the lobby`, { icon: "👋" });
          })
          .error((error: any) => {
            console.error("Channel error:", error);
            toast.error("Connection error - please refresh");
            isJoiningRef.current = false;
          })
          .listen("LobbyMessageSent", (e: any) => {
            console.log("New message received:", e);
            handleNewMessage(e.message);
          })
          .listen("PlayerJoinedLobby", (e: any) => {
            console.log("Player joined lobby event:", e);

            if (
              !currentLobbyRef.current ||
              currentLobbyRef.current.lobby_code !== lobbyCode
            ) {
              console.log("Ignoring PlayerJoinedLobby - not in matching lobby");
              return;
            }

            if (e.lobby && e.lobby.lobby_code === lobbyCode) {
              console.log("Updating lobby from PlayerJoinedLobby event data");
              setCurrentLobby(e.lobby);
            } else {
              console.log("Event data invalid, refreshing lobby");
              refreshLobby(lobbyCode);
            }
          })
          .listen("PlayerLeftLobby", (e: any) => {
            console.log("Player left lobby event:", e);

            if (
              !currentLobbyRef.current ||
              currentLobbyRef.current.lobby_code !== lobbyCode
            ) {
              console.log("Ignoring PlayerLeftLobby - not in matching lobby");
              return;
            }

            if (e.lobby && e.lobby.lobby_code === lobbyCode) {
              console.log("Updating lobby from PlayerLeftLobby event data");
              setCurrentLobby(e.lobby);
            } else {
              console.log("Event data invalid, refreshing lobby");
              refreshLobby(lobbyCode);
            }
          })
          .listen("LobbyStarted", (e: any) => {
            console.log("Lobby started event:", e);
            const lobbyData = e.lobby;

            if (!lobbyData || !lobbyData.id) {
              return;
            }

            toast.success("Game is starting!", { icon: "🎮" });

            setCurrentLobby((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                started: true,
                ...lobbyData,
              };
            });

            const gameSlug = lobbyData?.game?.slug;

            if (gameSlug) {
              const gameUrl = `/games/${gameSlug}?lobby=${lobbyData.lobby_code}`;
              setTimeout(() => {
                window.location.replace(gameUrl);
              }, 1000);
            } else {
              toast.error("Game data missing - please refresh and try again");
            }
          })
          .listen("PlayerReadyStatusChanged", (e: any) => {
            console.log("Player ready status changed:", e);
            if (e.user && typeof e.ready !== "undefined") {
              setCurrentLobby((prevLobby) => {
                if (!prevLobby) return prevLobby;

                const updatedPlayers = prevLobby.players.map(
                  (player: LobbyPlayer) => {
                    if (player.id === e.user.id) {
                      return {
                        ...player,
                        pivot: {
                          ...player.pivot,
                          ready: e.ready,
                        },
                      };
                    }
                    return player;
                  },
                );

                return {
                  ...prevLobby,
                  players: updatedPlayers,
                };
              });

              if (e.user.id !== authUserId) {
                toast.info(
                  `${e.user.name} is ${e.ready ? "ready" : "not ready"}`,
                );
              }
            }
          });

        channel.name = channelName;

        setTimeout(() => {
          channel.isReady = true;
          channelRef.current = channel;
          setCurrentChannel(channel);
          isJoiningRef.current = false;
          console.log("Channel ready and set");
        }, 500);

        return channel;
      } catch (error) {
        console.error("Failed to join channel:", error);
        isJoiningRef.current = false;
        toast.error("Failed to connect to lobby");
        return null;
      }
    },
    [leaveLobbyChannel, authUserId, handleNewMessage, refreshLobby],
  );

  const reconnectToLobbyByCode = useCallback(
    async (lobbyCode: string) => {
      if (!lobbyCode || currentLobby?.lobby_code === lobbyCode) {
        return currentLobby;
      }

      console.log("Reconnecting to lobby by code:", lobbyCode);
      setLoading(true);

      try {
        const res = await (window as any).axios.get(
          `/api/lobbies/${lobbyCode}`,
        );
        const lobby = res.data;

        if (!lobby || !lobby.lobby_code) {
          throw new Error("Invalid lobby data received");
        }

        console.log("Successfully fetched lobby for reconnection:", lobby);
        setCurrentLobby(lobby);

        const channel = joinLobbyChannel(lobby.lobby_code);
        if (channel) {
          await loadMessages(lobby.lobby_code);
        }

        if (lobby.started) {
          toast.success(`Reconnected to active game ${lobby.lobby_code}`, {
            icon: "🎮",
          });
        } else {
          toast.success(`Reconnected to lobby ${lobby.lobby_code}`, {
            icon: "🔗",
          });
        }

        return lobby;
      } catch (error) {
        console.error("Failed to reconnect to lobby:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentLobby, joinLobbyChannel, loadMessages],
  );

  const checkExistingLobby = useCallback(async () => {
    if (!authUserId || initializingRef.current) {
      console.log(
        "Skipping existing lobby check - no user or already initializing",
      );
      return;
    }

    initializingRef.current = true;
    setInitializing(true);

    try {
      console.log("Checking for existing lobby for user:", authUserId);

      try {
        const userLobbyRes = await (window as any).axios.get(
          "/api/lobbies/current",
        );
        const userLobby = userLobbyRes.data;

        if (userLobby && userLobby.lobby_code) {
          console.log("Found current lobby:", userLobby);
          setCurrentLobby(userLobby);

          const channel = joinLobbyChannel(userLobby.lobby_code);
          if (channel) {
            await loadMessages(userLobby.lobby_code);
          }

          const toastMessage = userLobby.started
            ? `Reconnected to active game lobby ${userLobby.lobby_code}`
            : `Reconnected to lobby ${userLobby.lobby_code}`;
          toast.success(toastMessage, { icon: "🔗" });
          return;
        }
      } catch (currentError) {
        console.log("No current lobby found, checking all lobbies");
      }

      const res = await (window as any).axios.get("/api/lobbies");
      const responseData = res.data;

      if (responseData.user_lobby && responseData.user_lobby.lobby_code) {
        const userLobby = responseData.user_lobby;
        console.log("Found user lobby in user_lobby field:", userLobby);
        setCurrentLobby(userLobby);

        const channel = joinLobbyChannel(userLobby.lobby_code);
        if (channel) {
          await loadMessages(userLobby.lobby_code);
        }

        const toastMessage = userLobby.started
          ? `Reconnected to active game lobby ${userLobby.lobby_code}`
          : `Reconnected to lobby ${userLobby.lobby_code}`;
        toast.success(toastMessage, { icon: "🔗" });
        return;
      }

      const lobbies = Array.isArray(responseData)
        ? responseData
        : responseData.lobbies
          ? responseData.lobbies
          : [];

      if (!Array.isArray(lobbies)) {
        console.log("No lobbies array found and no user_lobby");
        return;
      }

      const userLobby = lobbies.find(
        (lobby: Lobby) =>
          Array.isArray(lobby.players) &&
          lobby.players.some((player: LobbyPlayer) => player.id === authUserId),
      );

      if (userLobby && userLobby.lobby_code) {
        console.log("Found user lobby in lobbies array:", userLobby);
        setCurrentLobby(userLobby);

        const channel = joinLobbyChannel(userLobby.lobby_code);
        if (channel) {
          await loadMessages(userLobby.lobby_code);
        }

        const toastMessage = userLobby.started
          ? `Reconnected to active game lobby ${userLobby.lobby_code}`
          : `Reconnected to lobby ${userLobby.lobby_code}`;
        toast.success(toastMessage, { icon: "🔗" });
      } else {
        console.log("No existing lobby found for user");
      }
    } catch (error) {
      console.error("Error checking existing lobby:", error);
      toast.error("Failed to check for existing lobby");
    } finally {
      setInitializing(false);
      initializingRef.current = false;
    }
  }, [authUserId, joinLobbyChannel, loadMessages]);

  const sendMessage = useCallback(
    async (msg: string, user: User) => {
      if (!currentLobby || !msg.trim()) return;

      const optimisticId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        message: msg.trim(),
        user_id: authUserId || 0,
        user: {
          id: authUserId || 0,
          name: user.name,
          avatar: user.avatar,
        },
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        await (window as any).axios.post(
          `/api/lobbies/${currentLobby.lobby_code}/messages`,
          {
            message: msg.trim(),
          },
        );
      } catch (error: any) {
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimisticMessage.id),
        );
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    },
    [currentLobby, authUserId],
  );

  const createLobby = useCallback(async (gameId: number, password?: string) => {
    setLoading(true);
    const loadingToast = toast.loading("Creating lobby...");

    try {
      const res = await (window as any).axios.post("/api/lobbies", {
        game_id: gameId,
        password: password || null,
      });

      const lobby = res.data;

      if (!lobby.lobby_code) {
        throw new Error("Lobby created but no lobby code received");
      }

      console.log("Lobby created:", lobby);
      setCurrentLobby(lobby);

      const channel = joinLobbyChannel(lobby.lobby_code);
      if (channel) {
        await loadMessages(lobby.lobby_code);
      }

      toast.dismiss(loadingToast);
      toast.success("Lobby created!", { icon: "🎉" });

      return lobby;
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Create lobby error:", error);
      toast.error(error.response?.data?.message || "Failed to create lobby");
      throw error;
    } finally {
      setLoading(false);
    }
  });

  const joinLobby = useCallback(
    async (lobbyCode: string, password?: string) => {
      if (!lobbyCode.trim()) {
        toast.error("Please enter a valid lobby code");
        return;
      }

      setLoading(true);
      const loadingToast = toast.loading("Joining lobby...");

      try {
        const res = await (window as any).axios.post("/api/lobbies/join", {
          lobby_code: lobbyCode.trim(),
          password: password || null,
        });

        const lobby = res.data;

        if (!lobby.lobby_code) {
          throw new Error("Joined lobby but no lobby code received");
        }

        console.log("Joined lobby:", lobby);
        setCurrentLobby(lobby);

        const channel = joinLobbyChannel(lobby.lobby_code);
        if (channel) {
          await loadMessages(lobby.lobby_code);
        }

        toast.dismiss(loadingToast);
        toast.success("Joined lobby!", { icon: "🎮" });

        return lobby;
      } catch (error: any) {
        toast.dismiss(loadingToast);
        console.error("Join lobby error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to join lobby";
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [joinLobbyChannel, loadMessages],
  );

  const leaveLobby = useCallback(async () => {
    if (!currentLobby) return;

    const lobbyCodeToLeave = currentLobby.lobby_code;

    try {
      leaveLobbyChannel();

      setCurrentLobby(null);
      setMessages([]);
      setOnlineUsers([]);

      await (window as any).axios.post(
        `/api/lobbies/${lobbyCodeToLeave}/leave`,
      );

      toast.success("Left lobby");
    } catch (error: any) {
      console.error("Leave lobby error:", error);
      toast.error(error.response?.data?.message || "Failed to leave lobby");
    }
  }, [currentLobby, leaveLobbyChannel]);

  const findLobbyByCode = useCallback(
    async (lobbyCode: string) => {
      if (!lobbyCode.trim()) {
        throw new Error("Please enter a valid lobby code");
      }

      try {
        const res = await (window as any).axios.get(
          `/api/lobbies/${lobbyCode.trim()}`,
        );
        const lobby = res.data;

        if (lobby && lobby.lobby_code) {
          await reconnectToLobbyByCode(lobby.lobby_code);
          return lobby;
        }

        throw new Error("Lobby not found");
      } catch (error: any) {
        console.error("Find lobby error:", error);

        try {
          const res = await (window as any).axios.post("/api/lobbies/find", {
            lobby_code: lobbyCode.trim(),
          });
          return res.data;
        } catch (fallbackError: any) {
          throw new Error(
            fallbackError.response?.data?.message || "Lobby not found",
          );
        }
      }
    },
    [reconnectToLobbyByCode],
  );

  const toggleReady = useCallback(async () => {
    if (!currentLobby || !authUserId) return;

    const currentPlayer = currentLobby.players.find(
      (p: LobbyPlayer) => p.id === authUserId,
    );
    if (!currentPlayer) return;

    const newReadyStatus = !currentPlayer.pivot?.ready;

    setCurrentLobby((prevLobby) => {
      if (!prevLobby) return prevLobby;

      const updatedPlayers = prevLobby.players.map((player: LobbyPlayer) => {
        if (player.id === authUserId) {
          return {
            ...player,
            pivot: {
              ...player.pivot,
              ready: newReadyStatus,
            },
          };
        }
        return player;
      });

      return {
        ...prevLobby,
        players: updatedPlayers,
      };
    });

    toast.success(newReadyStatus ? "You are ready!" : "You are not ready");

    try {
      const res = await (window as any).axios.post(
        `/api/lobbies/${currentLobby.lobby_code}/ready`,
      );

      if (res.data.ready !== newReadyStatus) {
        setCurrentLobby((prevLobby) => {
          if (!prevLobby) return prevLobby;

          const updatedPlayers = prevLobby.players.map(
            (player: LobbyPlayer) => {
              if (player.id === authUserId) {
                return {
                  ...player,
                  pivot: {
                    ...player.pivot,
                    ready: res.data.ready,
                  },
                };
              }
              return player;
            },
          );

          return {
            ...prevLobby,
            players: updatedPlayers,
          };
        });
      }
    } catch (error: any) {
      setCurrentLobby((prevLobby) => {
        if (!prevLobby) return prevLobby;

        const updatedPlayers = prevLobby.players.map((player: LobbyPlayer) => {
          if (player.id === authUserId) {
            return {
              ...player,
              pivot: {
                ...player.pivot,
                ready: !newReadyStatus,
              },
            };
          }
          return player;
        });

        return {
          ...prevLobby,
          players: updatedPlayers,
        };
      });

      console.error("Toggle ready error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update ready status",
      );
    }
  }, [currentLobby, authUserId]);

  const startGame = useCallback(async () => {
    if (!currentLobby) return;

    try {
      const response = await (window as any).axios.post(
        `/api/lobbies/${currentLobby.lobby_code}/start`,
      );
      toast.success(response.data.message || "Game starting!");
    } catch (error: any) {
      console.error("Start game error:", error);
      toast.error(error.response?.data?.message || "Failed to start game");
    }
  }, [currentLobby]);

  const onWhisper = useCallback(
    (event: string, handler: (data: any) => void) => {
      if (!channelRef.current || !channelRef.current.isReady) {
        console.warn("Cannot setup whisper listener - channel not ready");
        return;
      }

      try {
        channelRef.current.listenForWhisper(event, handler);
        setWhisperHandlers((prev) => ({ ...prev, [event]: handler }));
      } catch (error) {
        console.warn("Whisper listen error:", error);
      }
    },
    [],
  );

  const sendWhisper = useCallback((event: string, data: any) => {
    if (!channelRef.current || !channelRef.current.isReady) {
      console.warn("Cannot send whisper - channel not ready");
      return;
    }

    try {
      const actualChannelName = `presence-${channelRef.current.name}`;
      const pusherChannel = (window as any).Echo?.connector?.pusher?.channels
        ?.channels?.[actualChannelName];

      if (pusherChannel && pusherChannel.trigger) {
        pusherChannel.trigger(`client-${event}`, data);
      } else {
        channelRef.current.whisper(event, data);
      }
    } catch (error) {
      console.warn("Whisper send error:", error);
    }
  }, []);

  const offWhisper = useCallback(
    (event: string) => {
      if (!channelRef.current || !whisperHandlers[event]) return;

      try {
        channelRef.current.stopListeningForWhisper(
          event,
          whisperHandlers[event],
        );
        setWhisperHandlers((prev) => {
          const newHandlers = { ...prev };
          delete newHandlers[event];
          return newHandlers;
        });
      } catch (error) {
        console.warn("Whisper off error:", error);
      }
    },
    [whisperHandlers],
  );

  useEffect(() => {
    console.log("useLobby initialization check:", {
      authUserId,
      currentLobby: currentLobby?.lobby_code,
      initializing: initializingRef.current,
    });

    if (authUserId && !currentLobby && !initializingRef.current) {
      console.log("Starting lobby initialization");
      checkExistingLobby();
    } else if (!authUserId) {
      console.log("No auth user, setting initializing to false");
      setInitializing(false);
    }
  }, [authUserId, currentLobby?.lobby_code]);

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
    offWhisper,
    reconnectToLobbyByCode,
  };
}
