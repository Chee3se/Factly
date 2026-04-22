import { useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  UserX,
  Clock,
  Mail,
  AlertCircle,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Props {
  auth: Auth;
  isOpen: boolean;
  onToggle: () => void;
  friendsHook?: ReturnType<typeof useFriends>;
  showInviteOptions?: boolean;
  onInviteFriend?: (friendId: number) => void;
  excludedFromInvite?: number[];
  showTab?: boolean;
}

export default function FriendsSidebar({
  auth,
  isOpen,
  onToggle,
  friendsHook: externalHook,
  showInviteOptions = false,
  onInviteFriend,
  excludedFromInvite = [],
  showTab = true,
}: Props) {
  const internalHook = useFriends(
    externalHook ? undefined : auth.user.id,
  );
  const hook = externalHook ?? internalHook;
  const { activeLobby } = useLobbyContext();
  const lobbyInviteEnabled = !showInviteOptions && !!activeLobby;
  const lobbyExcluded = new Set(activeLobby?.players?.map((p) => p.id) || []);
  const {
    friends,
    friendRequests,
    sentRequests,
    searchResults,
    loading,
    searchLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    cancelFriendRequest,
    getFriendshipStatus,
    clearSearch,
    onlineUserIds,
  } = hook;

  const [searchQuery, setSearchQuery] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState<number | null>(null);

  const getInitials = (name: string): string => {
    if (!name) return "??";
    return (
      name
        .split(" ")
        .map((word) => word?.[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  };

  const getAvatarUrl = (avatar?: string): string | null => {
    if (!avatar) return null;
    return `/storage/${avatar}`;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 4) {
      searchUsers(query);
    } else {
      clearSearch();
    }
  };

  const handleAcceptRequest = async (userId: number) => {
    const request = friendRequests.find((req) => req.id === userId);
    if (request && request.friend_request_id) {
      await acceptFriendRequest(request.friend_request_id, userId);
    }
  };

  const handleDeclineRequest = async (userId: number) => {
    const request = friendRequests.find((req) => req.id === userId);
    if (request && request.friend_request_id) {
      await declineFriendRequest(request.friend_request_id, userId);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    await removeFriend(friendId);
    setShowRemoveDialog(null);
  };

  const AvatarWithPresence = ({
    name,
    avatar,
    decoration,
    userId,
    showDot = true,
  }: {
    name: string;
    avatar?: string;
    decoration?: any;
    userId: number;
    showDot?: boolean;
  }) => {
    const isOnline = onlineUserIds?.has(userId);
    return (
      <div className="relative">
        <Avatar className="h-10 w-10" decoration={decoration}>
          <AvatarImage src={getAvatarUrl(avatar) || undefined} alt={name} />
          <AvatarFallback className="text-sm">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {showDot && (
          <span
            className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background ${
              isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
        )}
      </div>
    );
  };

  const hasBadge = friendRequests.length > 0;

  return (
    <>
      {showTab && (
        <div
          className={`fixed z-[60] transition-all duration-300 top-20 ${
            isOpen ? "right-80" : "right-0"
          }`}
        >
          <button
            onClick={onToggle}
            aria-label="Toggle friends"
            className="group relative flex flex-col items-center justify-center gap-1.5 h-24 w-11 rounded-l-xl rounded-r-none border border-r-0 border-border bg-primary text-primary-foreground shadow-lg hover:brightness-110 transition-all"
          >
            <Users className="h-4 w-4" />
            <span className="text-[10px] font-semibold tracking-wider uppercase [writing-mode:vertical-rl] rotate-180">
              Friends
            </span>
            {!isOpen && hasBadge && (
              <span className="absolute -top-1.5 -left-1.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums ring-2 ring-background animate-pulse">
                {friendRequests.length > 9 ? "9+" : friendRequests.length}
              </span>
            )}
          </button>
        </div>
      )}

      <div
        className={`fixed right-0 top-0 h-full w-80 border-l border-border bg-background z-[55] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } shadow-xl`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-semibold tracking-tight">Friends</h2>
              {showInviteOptions && (
                <Badge variant="outline" className="ml-1 text-[10px]">
                  Invite mode
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="friends" className="flex flex-col h-full">
              <div className="px-5 pt-4 pb-3">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="friends" className="text-xs">
                    Friends
                    {friends.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-4 text-xs px-1"
                      >
                        {friends.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="text-xs">
                    Requests
                    {friendRequests.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-1 h-4 text-xs px-1"
                      >
                        {friendRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="search" className="text-xs">
                    <UserPlus className="h-3 w-3" />
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="friends" className="h-full mt-0">
                  <ScrollArea className="h-full px-5">
                    {friends.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-10 w-10 text-muted-foreground/60 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No friends yet.
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Search to add someone.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pb-6">
                        {[...friends]
                          .sort((a, b) => {
                            const aOn = onlineUserIds?.has(a.id) ? 0 : 1;
                            const bOn = onlineUserIds?.has(b.id) ? 0 : 1;
                            if (aOn !== bOn) return aOn - bOn;
                            return a.name.localeCompare(b.name);
                          })
                          .map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <AvatarWithPresence
                                  name={friend.name}
                                  avatar={friend.avatar}
                                  decoration={friend.decoration}
                                  userId={friend.id}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {friend.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {onlineUserIds?.has(friend.id)
                                      ? "Online"
                                      : "Offline"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {showInviteOptions && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3"
                                    onClick={() =>
                                      onInviteFriend?.(friend.id)
                                    }
                                    disabled={
                                      loading ||
                                      excludedFromInvite.includes(friend.id)
                                    }
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Invite
                                  </Button>
                                )}
                                {lobbyInviteEnabled && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3"
                                    onClick={() =>
                                      hook.inviteFriendToLobby(
                                        friend.id,
                                        activeLobby!.lobby_code,
                                      )
                                    }
                                    disabled={
                                      loading || lobbyExcluded.has(friend.id)
                                    }
                                    title={
                                      lobbyExcluded.has(friend.id)
                                        ? "Already in your lobby"
                                        : "Invite to your lobby"
                                    }
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Invite
                                  </Button>
                                )}
                                {!showInviteOptions && (
                                  <Dialog
                                    open={showRemoveDialog === friend.id}
                                    onOpenChange={(open) =>
                                      setShowRemoveDialog(
                                        open ? friend.id : null,
                                      )
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                      >
                                        <UserX className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Remove friend</DialogTitle>
                                        <DialogDescription>
                                          Remove {friend.name} from your friends
                                          list?
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            setShowRemoveDialog(null)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() =>
                                            handleRemoveFriend(friend.id)
                                          }
                                          disabled={loading}
                                        >
                                          Remove
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="requests" className="h-full mt-0">
                  <ScrollArea className="h-full px-5">
                    {friendRequests.length === 0 &&
                    sentRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Mail className="h-10 w-10 text-muted-foreground/60 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No pending requests
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5 pb-6">
                        {friendRequests.length > 0 && (
                          <div>
                            <h4 className="text-[10px] uppercase tracking-wider font-semibold mb-2 text-muted-foreground">
                              Received
                            </h4>
                            <div className="space-y-1.5">
                              {friendRequests.map((request) => (
                                <div
                                  key={request.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/50"
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <AvatarWithPresence
                                      name={request.name}
                                      avatar={request.avatar}
                                      decoration={request.decoration}
                                      userId={request.id}
                                      showDot={false}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {request.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleAcceptRequest(request.id)
                                      }
                                      disabled={loading}
                                    >
                                      <Check className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleDeclineRequest(request.id)
                                      }
                                      disabled={loading}
                                    >
                                      <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sentRequests.length > 0 && (
                          <div>
                            <h4 className="text-[10px] uppercase tracking-wider font-semibold mb-2 text-muted-foreground">
                              Sent
                            </h4>
                            <div className="space-y-1.5">
                              {sentRequests.map((request) => (
                                <div
                                  key={request.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40"
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <AvatarWithPresence
                                      name={request.name}
                                      avatar={request.avatar}
                                      decoration={request.decoration}
                                      userId={request.id}
                                      showDot={false}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {request.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        cancelFriendRequest(request.id)
                                      }
                                      disabled={loading}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="search" className="h-full mt-0">
                  <div className="px-5 pb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search users (min 4 chars)"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {searchQuery.length > 0 && searchQuery.length < 4 && (
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        At least 4 characters
                      </div>
                    )}
                  </div>

                  <ScrollArea className="flex-1 px-5">
                    {searchLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="text-sm text-muted-foreground">
                          Searching...
                        </div>
                      </div>
                    ) : searchResults.length === 0 &&
                      searchQuery.length >= 4 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-10 w-10 text-muted-foreground/60 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No results for "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pb-6">
                        {searchResults.map((user) => {
                          const status = getFriendshipStatus(user.id);
                          return (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <AvatarWithPresence
                                  name={user.name}
                                  avatar={user.avatar}
                                  decoration={user.decoration}
                                  userId={user.id}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {user.name}
                                  </p>
                                  {user.decoration && (
                                    <p className="text-[11px] text-blue-500 truncate">
                                      {user.decoration.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {status === "none" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => sendFriendRequest(user.id)}
                                  disabled={loading}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                              {status === "friends" && (
                                <Badge variant="secondary" className="text-xs">
                                  Friends
                                </Badge>
                              )}
                              {status === "pending_sent" && (
                                <Badge variant="outline" className="text-xs">
                                  Pending
                                </Badge>
                              )}
                              {status === "pending_received" && (
                                <Badge variant="outline" className="text-xs">
                                  Received
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
