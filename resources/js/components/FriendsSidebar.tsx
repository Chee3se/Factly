import { useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import { User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogHeader,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    ChevronLeft,
    ChevronRight,
    Send
} from "lucide-react";

interface Props {
    auth: Auth;
    isOpen: boolean;
    onToggle: () => void;
    showInviteOptions?: boolean;
    onInviteFriend?: (friendId: number) => void;
}

export default function FriendsSidebar({ auth, isOpen, onToggle, showInviteOptions = false, onInviteFriend }: Props) {
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
    } = useFriends(auth.user.id);

    const [searchQuery, setSearchQuery] = useState("");
    const [showRemoveDialog, setShowRemoveDialog] = useState<number | null>(null);

    const getInitials = (name: string): string => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(word => word?.[0] || '')
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';
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

    const handleSendRequest = async (friendId: number) => {
        await sendFriendRequest(friendId);
    };

    const handleAcceptRequest = async (userId: number) => {
        const request = friendRequests.find(req => req.id === userId);
        if (request && request.friend_request_id) {
            await acceptFriendRequest(request.friend_request_id, userId);
        }
    };

    const handleDeclineRequest = async (userId: number) => {
        const request = friendRequests.find(req => req.id === userId);
        if (request && request.friend_request_id) {
            await declineFriendRequest(request.friend_request_id, userId);
        }
    };

    const handleRemoveFriend = async (friendId: number) => {
        await removeFriend(friendId);
        setShowRemoveDialog(null);
    };

    const handleCancelRequest = async (friendId: number) => {
        await cancelFriendRequest(friendId);
    };

    const handleInviteFriend = (friendId: number) => {
        if (onInviteFriend) {
            onInviteFriend(friendId);
        }
    };

    return (
        <>
            {/* Toggle Button - Always visible */}
            <div className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
                isOpen ? 'right-80' : 'right-0'
            }`}>
                <Button
                    onClick={onToggle}
                    variant="outline"
                    size="sm"
                    className="h-12 w-8 rounded-l-lg rounded-r-none border-r-0 bg-background/95 backdrop-blur shadow-lg hover:bg-muted/50"
                >
                    {isOpen ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4" />
                            {(friendRequests.length > 0 || friends.length > 0) && (
                                <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </>
                    )}
                </Button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            } shadow-xl`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Friends</h2>
                            {showInviteOptions && (
                                <Badge variant="outline" className="ml-2">
                                    Invite Mode
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

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        <Tabs defaultValue="friends" className="flex flex-col h-full">
                            <div className="px-6 pt-4 pb-3">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="friends" className="text-xs">
                                        Friends
                                        {friends.length > 0 && (
                                            <Badge variant="secondary" className="ml-1 h-4 text-xs px-1">
                                                {friends.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="requests" className="text-xs">
                                        Requests
                                        {friendRequests.length > 0 && (
                                            <Badge variant="destructive" className="ml-1 h-4 text-xs px-1">
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
                                    <ScrollArea className="h-full px-6">
                                        {friends.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                                <p className="text-sm text-muted-foreground">
                                                    No friends yet. Start by searching for people to connect with!
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 pb-6">
                                                {friends.map((friend) => (
                                                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage
                                                                    src={getAvatarUrl(friend.avatar) || undefined}
                                                                    alt={friend.name}
                                                                />
                                                                <AvatarFallback className="text-sm">
                                                                    {getInitials(friend.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">{friend.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* Show invite button when in invite mode */}
                                                            {showInviteOptions && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3"
                                                                    onClick={() => handleInviteFriend(friend.id)}
                                                                    disabled={loading}
                                                                >
                                                                    <Send className="h-3 w-3 mr-1" />
                                                                    Invite
                                                                </Button>
                                                            )}
                                                            {/* Only show remove button when NOT in invite mode */}
                                                            {!showInviteOptions && (
                                                                <Dialog
                                                                    open={showRemoveDialog === friend.id}
                                                                    onOpenChange={(open) => setShowRemoveDialog(open ? friend.id : null)}
                                                                >
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <UserX className="h-4 w-4" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-md">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Remove Friend</DialogTitle>
                                                                            <DialogDescription>
                                                                                Are you sure you want to remove {friend.name} from your friends list?
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <DialogFooter>
                                                                            <Button
                                                                                variant="outline"
                                                                                onClick={() => setShowRemoveDialog(null)}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                            <Button
                                                                                variant="destructive"
                                                                                onClick={() => handleRemoveFriend(friend.id)}
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
                                    <ScrollArea className="h-full px-6">
                                        {friendRequests.length === 0 && sentRequests.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                                                <p className="text-sm text-muted-foreground">
                                                    No pending friend requests
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pb-6">
                                                {friendRequests.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Received</h4>
                                                        <div className="space-y-2">
                                                            {friendRequests.map((request) => (
                                                                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                        <Avatar className="h-10 w-10">
                                                                            <AvatarImage
                                                                                src={getAvatarUrl(request.avatar) || undefined}
                                                                                alt={request.name}
                                                                            />
                                                                            <AvatarFallback className="text-sm">
                                                                                {getInitials(request.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm truncate">{request.name}</p>
                                                                            <p className="text-xs text-muted-foreground truncate">{request.email}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={() => handleAcceptRequest(request.id)}
                                                                            disabled={loading}
                                                                        >
                                                                            <Check className="h-4 w-4 text-green-600" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={() => handleDeclineRequest(request.id)}
                                                                            disabled={loading}
                                                                        >
                                                                            <X className="h-4 w-4 text-red-600" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {sentRequests.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Sent</h4>
                                                        <div className="space-y-2">
                                                            {sentRequests.map((request) => (
                                                                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                        <Avatar className="h-10 w-10">
                                                                            <AvatarImage
                                                                                src={getAvatarUrl(request.avatar) || undefined}
                                                                                alt={request.name}
                                                                            />
                                                                            <AvatarFallback className="text-sm">
                                                                                {getInitials(request.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm truncate">{request.name}</p>
                                                                            <p className="text-xs text-muted-foreground truncate">{request.email}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={() => handleCancelRequest(request.id)}
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
                                    <div className="px-6 pb-4">
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
                                            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
                                                <AlertCircle className="h-3 w-3" />
                                                Enter at least 4 characters to search
                                            </div>
                                        )}
                                    </div>

                                    <ScrollArea className="flex-1 px-6">
                                        {searchLoading ? (
                                            <div className="flex justify-center py-12">
                                                <div className="text-sm text-muted-foreground">Searching...</div>
                                            </div>
                                        ) : searchResults.length === 0 && searchQuery.length >= 4 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                                <p className="text-sm text-muted-foreground">
                                                    No users found matching "{searchQuery}"
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 pb-6">
                                                {searchResults.map((user) => {
                                                    const status = getFriendshipStatus(user.id);
                                                    return (
                                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarImage
                                                                        src={getAvatarUrl(user.avatar) || undefined}
                                                                        alt={user.name}
                                                                    />
                                                                    <AvatarFallback className="text-sm">
                                                                        {getInitials(user.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm truncate">{user.name}</p>
                                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                                </div>
                                                            </div>
                                                            {status === 'none' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => handleSendRequest(user.id)}
                                                                    disabled={loading}
                                                                >
                                                                    <UserPlus className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {status === 'friends' && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Friends
                                                                </Badge>
                                                            )}
                                                            {status === 'pending_sent' && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                            {status === 'pending_received' && (
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
