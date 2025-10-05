import { User } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { FriendsData } from "@/types/friends";

export function useFriends(authUserId?: number) {
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [privateChannel, setPrivateChannel] = useState<any>(null);

  const [lobbyInvitation, setLobbyInvitation] = useState<{
    inviter: { id: number; name: string; avatar?: string };
    lobby_code: string;
    game_name: string;
    message: string;
  } | null>(null);

  const channelRef = useRef<any>(null);
  const initializingRef = useRef(false);

  const refreshSentRequests = useCallback(async () => {
    if (!authUserId) return;

    try {
      const res = await (window as any).axios.get("/friends");
      const data: FriendsData = res.data;
      setSentRequests(data.sent_requests || []);
    } catch (error: any) {
      console.error("Failed to refresh sent requests:", error);
    }
  }, [authUserId]);

  const loadFriends = useCallback(async () => {
    if (!authUserId || initializingRef.current) return;

    initializingRef.current = true;
    setInitializing(true);

    try {
      const res = await (window as any).axios.get("/friends");
      const data: FriendsData = res.data;

      setFriends(data.friends || []);
      setFriendRequests(data.friend_requests || []);
      setSentRequests(data.sent_requests || []);
    } catch (error: any) {
      console.error("Failed to load friends:", error);
      toast.error("Failed to load friends");
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
    } finally {
      setInitializing(false);
      initializingRef.current = false;
    }
  }, [authUserId]);

  const joinPrivateChannel = useCallback(() => {
    if (!window.Echo || !authUserId) {
      return null;
    }

    if (channelRef.current) {
      return channelRef.current;
    }

    try {
      const channelName = `user.${authUserId}`;

      const channel = window.Echo.private(channelName)
        .listen("FriendRequestSent", (e: any) => {
          console.log("FriendRequestSent event received:", e);
          const sender = e.sender;
          const requestId = e.request_id;
          if (sender && sender.id && sender.name && requestId) {
            setFriendRequests((prev) => {
              const exists = prev.some((req) => req.id === sender.id);
              if (!exists) {
                return [
                  ...prev,
                  {
                    id: sender.id,
                    name: sender.name,
                    email: sender.email || "",
                    avatar: sender.avatar || null,
                    friend_request_id: requestId,
                  },
                ];
              }
              return prev;
            });
            toast.success(`Friend request from ${sender.name}`, { icon: "👋" });
          }
        })
        .listen("FriendRequestAccepted", (e: any) => {
          const friend = e.friend;
          if (friend && friend.id && friend.name) {
            setFriends((prev) => {
              const exists = prev.some((f) => f.id === friend.id);
              if (!exists) {
                return [
                  ...prev,
                  {
                    id: friend.id,
                    name: friend.name,
                    email: friend.email || "",
                    avatar: friend.avatar || null,
                  },
                ];
              }
              return prev;
            });

            setSentRequests((prev) =>
              prev.filter((req) => req.id !== friend.id),
            );
            setSearchResults((prev) =>
              prev.filter((user) => user.id !== friend.id),
            );

            toast.success(
              e.message || `${friend.name} accepted your friend request!`,
              { icon: "🎉" },
            );
          }
        })
        .listen("FriendRequestDeclined", (e: any) => {
          toast.info(e.message || "Your friend request was declined", {
            icon: "❌",
          });
          refreshSentRequests();
        })
        .listen("FriendRemoved", (e: any) => {
          if (e.removed_by_id && e.removed_user_id) {
            setFriends((prev) =>
              prev.filter((friend) => friend.id !== e.removed_by_id),
            );
            const removedByName = e.removed_by_name || "Someone";
            toast.info(`${removedByName} removed you as a friend`, {
              icon: "👋",
            });
          }
        })
        .listen("FriendRequestCancelled", (e: any) => {
          if (e.sender_id) {
            setFriendRequests((prev) =>
              prev.filter((req) => req.id !== e.sender_id),
            );
            toast.info(e.message || "A friend request was cancelled");
          }
        })
        .listen("LobbyInvitationSent", (e: any) => {
          if (e.inviter && e.lobby_code && e.game_name) {
            setLobbyInvitation({
              inviter: e.inviter,
              lobby_code: e.lobby_code,
              game_name: e.game_name,
              message: e.message,
            });

            toast.info(
              `${e.inviter.name} invited you to join their ${e.game_name} lobby!`,
              {
                icon: "🎮",
                duration: 10000, // 10 seconds
                action: {
                  label: "View Invite",
                  onClick: () => {
                    // Toast action will be handled by the consuming component
                  },
                },
              },
            );
          }
        })
        .error((error: any) => {
          console.error("Echo channel error:", error);
          if (error.type === "AuthError") {
            console.error(
              "Authentication failed for private channel. Check your broadcasting auth setup.",
            );
            toast.error(
              "Failed to connect to real-time updates. Please refresh the page.",
            );
          }
        });

      channelRef.current = channel;
      setPrivateChannel(channel);
      return channel;
    } catch (error) {
      console.error("Failed to join private channel:", error);
      toast.error("Failed to connect to friend notifications");
      return null;
    }
  }, [authUserId, refreshSentRequests]);

  const leavePrivateChannel = useCallback(() => {
    if (channelRef.current && window.Echo) {
      try {
        window.Echo.leave(channelRef.current.name);
      } catch (error) {
        console.error("Error leaving channel:", error);
      }
      channelRef.current = null;
      setPrivateChannel(null);
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 4) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const res = await (window as any).axios.get("/friends/search", {
        params: { query },
      });
      setSearchResults(res.data.users || []);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Search failed";
      if (error.response?.status === 422) {
        toast.error("Search requires at least 4 characters");
      } else {
        toast.error(errorMessage);
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const sendFriendRequest = useCallback(async (friendId: number) => {
    setLoading(true);

    try {
      const res = await (window as any).axios.post("/friends/send-request", {
        friend_id: friendId,
      });

      const requestData = res.data.request;
      if (requestData && requestData.friendUser) {
        setSentRequests((prev) => {
          const exists = prev.some(
            (req) => req.id === requestData.friendUser.id,
          );
          if (!exists) {
            return [
              ...prev,
              {
                id: requestData.friendUser.id,
                name: requestData.friendUser.name,
                email: requestData.friendUser.email || "",
                avatar: requestData.friendUser.avatar || null,
              },
            ];
          }
          return prev;
        });
      }

      setSearchResults((prev) => prev.filter((user) => user.id !== friendId));
      toast.success("Friend request sent!", { icon: "✉️" });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send friend request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptFriendRequest = useCallback(
    async (friendRequestId: number, userId: number) => {
      setLoading(true);

      try {
        const res = await (window as any).axios.post(
          "/friends/accept-request",
          {
            request_id: friendRequestId,
          },
        );

        const friend = res.data.friend;
        if (friend && friend.id) {
          setFriends((prev) => {
            const exists = prev.some((f) => f.id === friend.id);
            if (!exists) {
              return [
                ...prev,
                {
                  id: friend.id,
                  name: friend.name,
                  email: friend.email || "",
                  avatar: friend.avatar || null,
                },
              ];
            }
            return prev;
          });

          setFriendRequests((prev) => prev.filter((req) => req.id !== userId));
        }

        toast.success("Friend request accepted!", { icon: "🎉" });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to accept friend request";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const declineFriendRequest = useCallback(
    async (friendRequestId: number, userId: number) => {
      setLoading(true);

      try {
        await (window as any).axios.post("/friends/decline-request", {
          request_id: friendRequestId,
        });

        setFriendRequests((prev) => prev.filter((req) => req.id !== userId));
        toast.success("Friend request declined");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to decline friend request";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const removeFriend = useCallback(async (friendId: number) => {
    setLoading(true);

    try {
      await (window as any).axios.delete("/friends/remove", {
        data: { friend_id: friendId },
      });

      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
      toast.success("Friend removed");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove friend";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelFriendRequest = useCallback(async (friendId: number) => {
    setLoading(true);

    try {
      await (window as any).axios.delete("/friends/cancel-request", {
        data: { friend_id: friendId },
      });

      setSentRequests((prev) => prev.filter((req) => req.id !== friendId));
      toast.success("Friend request cancelled");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to cancel friend request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFriendshipStatus = useCallback(
    (userId: number) => {
      if (friends.some((f) => f.id === userId)) {
        return "friends";
      }
      if (friendRequests.some((req) => req.id === userId)) {
        return "pending_received";
      }
      if (sentRequests.some((req) => req.id === userId)) {
        return "pending_sent";
      }
      return "none";
    },
    [friends, friendRequests, sentRequests],
  );

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  const refreshFriends = useCallback(async () => {
    if (!authUserId) return;
    await loadFriends();
  }, [loadFriends, authUserId]);

  useEffect(() => {
    if (authUserId && !initializingRef.current) {
      loadFriends();
      joinPrivateChannel();
    } else if (!authUserId) {
      setInitializing(false);
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
      setSearchResults([]);
      setLobbyInvitation(null);
    }
  }, [authUserId, loadFriends, joinPrivateChannel]);

  useEffect(() => {
    return () => {
      leavePrivateChannel();
    };
  }, [leavePrivateChannel]);

  const inviteFriendToLobby = useCallback(
    async (friendId: number, lobbyCode: string) => {
      try {
        await (window as any).axios.post("/friends/invite-to-lobby", {
          friend_id: friendId,
          lobby_code: lobbyCode,
        });

        const friend = friends.find((f) => f.id === friendId);
        const friendName = friend?.name || "Friend";
        toast.success(`Invited ${friendName} to the lobby!`, { icon: "✉️" });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to send lobby invitation";
        toast.error(errorMessage);
      }
    },
    [friends],
  );

  const acceptLobbyInvitation = useCallback(async (lobbyCode: string) => {
    // Clear the invitation immediately
    setLobbyInvitation(null);

    // Simply redirect to the lobby route
    window.location.href = `/lobbies/${lobbyCode}`;
  }, []);

  const declineLobbyInvitation = useCallback(() => {
    setLobbyInvitation(null);
    toast.info("Lobby invitation declined");
  }, []);

  return {
    friends,
    friendRequests,
    sentRequests,
    searchResults,
    loading: loading || initializing,
    searchLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    cancelFriendRequest,
    getFriendshipStatus,
    clearSearch,
    refreshFriends,
    privateChannel,
    inviteFriendToLobby,
    lobbyInvitation,
    acceptLobbyInvitation,
    declineLobbyInvitation,
  };
}
