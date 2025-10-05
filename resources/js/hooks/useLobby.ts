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
  const [userReady, setUserReady] = useState<Map<number, boolean>>(new Map());
  const [whisperQueue, setWhisperQueue] = useState<
    Map<number, Array<{ event: string; data: any }>>
  >(new Map());

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
        window.Echo.leave(channelRef.current.name);
      } catch (error) {
        console.warn("Error leaving channel:", error);
      }
      channelRef.current = null;
      setCurrentChannel(null);
      setWhisperHandlers({});
      setUserReady(new Map());
      setWhisperQueue(new Map());
    }
  }, []);

  const refreshLobby = useCallback(async (lobbyCode: string) => {
    if (!lobbyCode) return;
    try {
      const res = await (window as any).axios.get(`/api/lobbies/${lobbyCode}`);

      setCurrentLobby((prevLobby) => {
        if (res.data && res.data.lobby_code === lobbyCode) {
          return {
            ...prevLobby,
            ...res.data,
          };
        }
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

  const sendWhisper = useCallback(
    (event: string, data: any, targetUserId?: number) => {
      if (!channelRef.current || !channelRef.current.isReady) {
        console.warn("Cannot send whisper - channel not ready");
        return;
      }

      const whisperData = targetUserId ? { ...data, targetUserId } : data;

      if (targetUserId && !userReady.get(targetUserId)) {
        setWhisperQueue((prev) => {
          const newQueue = new Map(prev);
          if (!newQueue.has(targetUserId)) newQueue.set(targetUserId, []);
          newQueue.get(targetUserId)!.push({ event, data: whisperData });
          return newQueue;
        });
        return;
      }

      try {
        const actualChannelName = `presence-${channelRef.current.name}`;
        const pusherChannel = (window as any).Echo?.connector?.pusher?.channels
          ?.channels?.[actualChannelName];

        if (pusherChannel && pusherChannel.trigger) {
          pusherChannel.trigger(`client-${event}`, whisperData);
        } else {
          console.warn("Pusher channel not ready for whisper");
        }
      } catch (error) {
        console.warn("Whisper send error:", error);
      }
    },
    [userReady],
  );

  const joinLobbyChannel = useCallback(
    (lobbyCode: string) => {
      if (!window.Echo || !lobbyCode || isJoiningRef.current) {
        return null;
      }

      if (
        channelRef.current &&
        channelRef.current.name === `lobby.${lobbyCode}`
      ) {
        return channelRef.current;
      }

      isJoiningRef.current = true;
      leaveLobbyChannel();

      try {
        const channelName = `lobby.${lobbyCode}`;

        const channel = window.Echo.join(channelName)
          .here((users: any[]) => {
            setOnlineUsers(users || []);
          })
          .joining((user: any) => {
            setOnlineUsers((prev) => {
              if (prev.find((u) => u.id === user.id)) {
                return prev;
              }
              return [...prev, user];
            });
            toast.success(`${user.name} joined the lobby`, { icon: "👋" });
            setUserReady((prev) => new Map(prev).set(user.id, false));
            sendWhisper("ping", {}, user.id);
            setTimeout(
              () => setUserReady((prev) => new Map(prev).set(user.id, true)),
              5000,
            );
          })
          .leaving((user: any) => {
            setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
            toast.warning(`${user.name} left the lobby`, { icon: "👋" });
            setUserReady((prev) => {
              const m = new Map(prev);
              m.delete(user.id);
              return m;
            });
            setWhisperQueue((prev) => {
              const m = new Map(prev);
              m.delete(user.id);
              return m;
            });
          })
          .error((error: any) => {
            console.error("Channel error:", error);
            toast.error("Connection error - please refresh");
            isJoiningRef.current = false;
          })
          .listen("LobbyMessageSent", (e: any) => {
            handleNewMessage(e.message);
          })
          .listen("PlayerJoinedLobby", (e: any) => {
            if (
              !currentLobbyRef.current ||
              currentLobbyRef.current.lobby_code !== lobbyCode
            ) {
              return;
            }

            if (e.lobby && e.lobby.lobby_code === lobbyCode) {
              setCurrentLobby(e.lobby);
            } else {
              refreshLobby(lobbyCode);
            }
          })
          .listen("PlayerLeftLobby", (e: any) => {
            if (
              !currentLobbyRef.current ||
              currentLobbyRef.current.lobby_code !== lobbyCode
            ) {
              return;
            }

            if (e.lobby && e.lobby.lobby_code === lobbyCode) {
              setCurrentLobby(e.lobby);
            } else {
              refreshLobby(lobbyCode);
            }
          })
          .listen("LobbyStarted", (e: any) => {
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

        channel.listenForWhisper("ping", (data: any) => {
          if (data.targetUserId === authUserId) {
            sendWhisper("pong", { fromUserId: authUserId });
          }
        });

        channel.listenForWhisper("pong", (data: any) => {
          if (data.fromUserId) {
            setUserReady((prev) => new Map(prev).set(data.fromUserId, true));
            setWhisperQueue((prev) => {
              const queue = prev.get(data.fromUserId);
              if (queue) {
                queue.forEach(({ event, data: qdata }) =>
                  sendWhisper(event, qdata),
                );
              }
              const newQueue = new Map(prev);
              newQueue.delete(data.fromUserId);
              return newQueue;
            });
          }
        });

        channel.name = channelName;

        setTimeout(() => {
          channel.isReady = true;
          channelRef.current = channel;
          setCurrentChannel(channel);
          isJoiningRef.current = false;
        }, 2000);

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

      setLoading(true);

      try {
        const res = await (window as any).axios.get(
          `/api/lobbies/${lobbyCode}`,
        );
        const lobby = res.data;

        if (!lobby || !lobby.lobby_code) {
          throw new Error("Invalid lobby data received");
        }

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
      return;
    }

    initializingRef.current = true;
    setInitializing(true);

    try {
      try {
        const userLobbyRes = await (window as any).axios.get(
          "/api/lobbies/current",
        );
        const userLobby = userLobbyRes.data;

        if (userLobby && userLobby.lobby_code) {
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
        // No current lobby found, checking all lobbies
      }

      const res = await (window as any).axios.get("/api/lobbies");
      const responseData = res.data;

      if (responseData.user_lobby && responseData.user_lobby.lobby_code) {
        const userLobby = responseData.user_lobby;
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
        return;
      }

      const userLobby = lobbies.find(
        (lobby: Lobby) =>
          Array.isArray(lobby.players) &&
          lobby.players.some((player: LobbyPlayer) => player.id === authUserId),
      );

      if (userLobby && userLobby.lobby_code) {
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
        // No existing lobby found for user
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

      const wrappedHandler = (data: any) => {
        if (data.targetUserId && data.targetUserId !== authUserId) return;
        handler(data);
      };

      try {
        channelRef.current.listenForWhisper(event, wrappedHandler);
        setWhisperHandlers((prev) => ({ ...prev, [event]: wrappedHandler }));
      } catch (error) {
        console.warn("Whisper listen error:", error);
      }
    },
    [authUserId],
  );

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
    if (authUserId && !currentLobby && !initializingRef.current) {
      checkExistingLobby();
    } else if (!authUserId) {
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
