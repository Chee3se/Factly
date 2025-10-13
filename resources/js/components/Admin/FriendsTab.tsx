import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { AdminFriend, PaginatedData } from "@/types/admin";

interface FriendsTabProps {
  friends: PaginatedData<AdminFriend>;
  onUpdateFriends: (
    updater: (prev: PaginatedData<AdminFriend>) => PaginatedData<AdminFriend>,
  ) => void;
}

export default function FriendsTab({
  friends,
  onUpdateFriends,
}: FriendsTabProps) {
  const [selectedFriend, setSelectedFriend] = useState<AdminFriend | null>(
    null,
  );
  const [showFriendActionModal, setShowFriendActionModal] = useState(false);
  const [friendAction, setFriendAction] = useState<"approve" | "decline">(
    "approve",
  );
  const [isProcessingFriend, setIsProcessingFriend] = useState(false);

  const openFriendActionModal = (
    friend: AdminFriend,
    action: "approve" | "decline",
  ) => {
    setSelectedFriend(friend);
    setFriendAction(action);
    setShowFriendActionModal(true);
  };

  const closeFriendActionModal = () => {
    setSelectedFriend(null);
    setShowFriendActionModal(false);
    setFriendAction("approve");
  };

  const handleFriendAction = async () => {
    if (!selectedFriend) return;

    setIsProcessingFriend(true);
    try {
      const response = await axios.patch(
        `/admin/friends/${selectedFriend.id}/approve`,
        {
          action: friendAction,
        },
      );
      if (response.data.success) {
        if (friendAction === "approve") {
          onUpdateFriends((prev) => ({
            ...prev,
            data: prev.data.map((friend) =>
              friend.id === selectedFriend.id
                ? { ...friend, accepted: true }
                : friend,
            ),
          }));
        } else {
          onUpdateFriends((prev) => ({
            ...prev,
            data: prev.data.filter((friend) => friend.id !== selectedFriend.id),
            total: prev.total - 1,
          }));
        }
        toast.success(response.data.message);
        closeFriendActionModal();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to process friend request.";
      toast.error(message);
    } finally {
      setIsProcessingFriend(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFriendStatusBadge = (accepted: boolean) => {
    if (accepted) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Friend Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Friend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {friends.data.map((friend) => (
                <TableRow key={friend.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {friend.user?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {friend.user?.email || "unknown@example.com"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {friend.friend_user?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {friend.friend_user?.email || "unknown@example.com"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getFriendStatusBadge(friend.accepted)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(friend.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {!friend.accepted && (
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openFriendActionModal(friend, "approve")
                          }
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openFriendActionModal(friend, "decline")
                          }
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Friend Action Modal */}
      <Dialog
        open={showFriendActionModal}
        onOpenChange={setShowFriendActionModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {friendAction === "approve"
                ? "Approve Friend Request"
                : "Decline Friend Request"}
            </DialogTitle>
            <DialogDescription>
              {friendAction === "approve"
                ? `Are you sure you want to approve the friend request between ${selectedFriend?.user?.name || "Unknown User"} and ${selectedFriend?.friendUser?.name || "Unknown User"}?`
                : `Are you sure you want to decline the friend request between ${selectedFriend?.user?.name || "Unknown User"} and ${selectedFriend?.friendUser?.name || "Unknown User"}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeFriendActionModal}>
              Cancel
            </Button>
            <Button
              onClick={handleFriendAction}
              disabled={isProcessingFriend}
              className={
                friendAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isProcessingFriend
                ? "Processing..."
                : friendAction === "approve"
                  ? "Approve Request"
                  : "Decline Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
