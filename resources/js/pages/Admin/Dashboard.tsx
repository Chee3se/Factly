import React, { useState } from "react";
import App from "@/layouts/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users as UsersIcon,
  UserCheck,
  User,
  Trophy,
  UserPlus,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  BarChart3,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  friends_count: number;
  scores_count: number;
}

interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  accepted: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  friendUser?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Suggestion {
  id: number;
  title: string;
  description: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "implemented";
  created_at: string;
  admin_notes?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Props {
  auth: Auth;
  stats: {
    total_users: number;
    total_admins: number;
    total_friends: number;
    pending_friend_requests: number;
    total_games: number;
    total_scores: number;
    total_suggestions: number;
    pending_suggestions: number;
    approved_suggestions: number;
    rejected_suggestions: number;
  };
  users: {
    data: User[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  friends: {
    data: Friend[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  suggestions: {
    data: Suggestion[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function Dashboard({
  auth,
  stats,
  users: initialUsers,
  friends: initialFriends,
  suggestions: initialSuggestions,
}: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  // Local state for data management
  const [users, setUsers] = useState(initialUsers);
  const [friends, setFriends] = useState(initialFriends);
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  // User management state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin",
  });
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Friend management state
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendActionModal, setShowFriendActionModal] = useState(false);
  const [friendAction, setFriendAction] = useState<"approve" | "decline">(
    "approve",
  );
  const [isProcessingFriend, setIsProcessingFriend] = useState(false);

  // Suggestion management state
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdatingSuggestion, setIsUpdatingSuggestion] = useState(false);

  // User management functions
  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditUserModal(true);
  };

  const closeEditUserModal = () => {
    setEditingUser(null);
    setShowEditUserModal(false);
    setEditUserForm({ name: "", email: "", role: "user" });
  };

  const openDeleteUserDialog = (user: User) => {
    setUserToDelete(user);
    setShowDeleteUserDialog(true);
  };

  const closeDeleteUserDialog = () => {
    setUserToDelete(null);
    setShowDeleteUserDialog(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setIsUpdatingUser(true);
    try {
      const response = await axios.patch(
        `/admin/users/${editingUser.id}`,
        editUserForm,
      );
      if (response.data.success) {
        // Update local state instead of reloading
        setUsers((prev) => ({
          ...prev,
          data: prev.data.map((user) =>
            user.id === editingUser.id ? { ...user, ...editUserForm } : user,
          ),
        }));
        toast.success(response.data.message);
        closeEditUserModal();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        const message =
          error.response?.data?.message ||
          "Failed to update user. Please check the form.";
        toast.error(message);
      }
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const response = await axios.delete(`/admin/users/${userToDelete.id}`);
      if (response.data.success) {
        // Update local state instead of reloading
        setUsers((prev) => ({
          ...prev,
          data: prev.data.filter((user) => user.id !== userToDelete.id),
          total: prev.total - 1,
        }));
        toast.success(response.data.message);
        closeDeleteUserDialog();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete user.";
      toast.error(message);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Friend management functions
  const openFriendActionModal = (
    friend: Friend,
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
        // Update local state instead of reloading
        if (friendAction === "approve") {
          setFriends((prev) => ({
            ...prev,
            data: prev.data.map((friend) =>
              friend.id === selectedFriend.id
                ? { ...friend, accepted: true }
                : friend,
            ),
          }));
        } else {
          // Remove declined friend request
          setFriends((prev) => ({
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

  // Suggestion management functions
  const openSuggestionModal = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminNotes(suggestion.admin_notes || "");
    setShowSuggestionModal(true);
  };

  const closeSuggestionModal = () => {
    setSelectedSuggestion(null);
    setShowSuggestionModal(false);
    setAdminNotes("");
  };

  const handleUpdateSuggestion = async (
    status: "pending" | "reviewing" | "approved" | "rejected" | "implemented",
  ) => {
    if (!selectedSuggestion) return;

    setIsUpdatingSuggestion(true);
    try {
      const response = await axios.patch(
        `/admin/suggestions/${selectedSuggestion.id}/status`,
        {
          status: status,
          admin_notes: adminNotes,
        },
      );
      if (response.data.success) {
        // Update local state instead of reloading
        setSuggestions((prev) => ({
          ...prev,
          data: prev.data.map((suggestion) =>
            suggestion.id === selectedSuggestion.id
              ? { ...suggestion, status: status, admin_notes: adminNotes }
              : suggestion,
          ),
        }));
        toast.success(response.data.message);
        closeSuggestionModal();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update suggestion.";
      toast.error(message);
    } finally {
      setIsUpdatingSuggestion(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      reviewing: { color: "bg-blue-100 text-blue-800", icon: Settings },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      implemented: {
        color: "bg-purple-100 text-purple-800",
        icon: CheckCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Admin Users",
      value: stats.total_admins,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Friends",
      value: stats.total_friends,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Friend Requests",
      value: stats.pending_friend_requests,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Scores",
      value: stats.total_scores,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Total Suggestions",
      value: stats.total_suggestions,
      icon: Lightbulb,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
  ];

  return (
    <App title="Admin Dashboard" auth={auth}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Unified management interface for users, friends, and suggestions
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="overview"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Users ({users.total})
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Friends ({friends.total})
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              Suggestions ({suggestions.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stat.value.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab("users")}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <UsersIcon className="h-6 w-6" />
                    <span>Manage Users</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("friends")}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <UserPlus className="h-6 w-6" />
                    <span>Manage Friends</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("suggestions")}
                    className="h-20 flex flex-col items-center gap-2"
                    variant="outline"
                  >
                    <Lightbulb className="h-6 w-6" />
                    <span>Review Suggestions</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Friends</TableHead>
                      <TableHead>Scores</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role === "admin" ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" /> Admin
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" /> User
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <UserPlus className="h-4 w-4 text-green-600" />
                            {user.friends_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            {user.scores_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditUserModal(user)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteUserDialog(user)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {friends.data.map((friend) => (
                      <TableRow key={friend.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {friend.user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {friend.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {friend.friendUser?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {friend.friendUser?.email ||
                                "unknown@example.com"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getFriendStatusBadge(friend.accepted)}
                        </TableCell>
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
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.data.map((suggestion) => (
                      <TableRow key={suggestion.id}>
                        <TableCell className="font-medium">
                          {suggestion.title}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {suggestion.user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {suggestion.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(suggestion.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(suggestion.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSuggestionModal(suggestion)}
                            className="flex items-center gap-1"
                          >
                            <Settings className="h-3 w-3" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Modal */}
        <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role. Changes will take effect
                immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editUserForm.name}
                  onChange={(e) =>
                    setEditUserForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="col-span-3"
                  maxLength={20}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) =>
                    setEditUserForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="col-span-3"
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={editUserForm.role}
                  onValueChange={(value: "user" | "admin") =>
                    setEditUserForm((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeEditUserModal}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={isUpdatingUser}>
                {isUpdatingUser ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog
          open={showDeleteUserDialog}
          onOpenChange={setShowDeleteUserDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user account for <strong>{userToDelete?.name}</strong> and
                remove all associated data.
                {userToDelete?.role === "admin" && (
                  <span className="block mt-2 text-red-600">
                    Warning: This user has admin privileges. Deleting admin
                    users may affect system functionality.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDeleteUserDialog}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={isDeletingUser}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingUser ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

        {/* Suggestion Review Modal */}
        <Dialog
          open={showSuggestionModal}
          onOpenChange={setShowSuggestionModal}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Suggestion</DialogTitle>
              <DialogDescription>
                Review and update the status of this game suggestion.
              </DialogDescription>
            </DialogHeader>
            {selectedSuggestion && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedSuggestion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted by {selectedSuggestion.user.name} on{" "}
                    {formatDate(selectedSuggestion.created_at)}
                  </p>
                </div>
                <div>
                  <Label>Description</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedSuggestion.description}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="admin-notes">Admin Notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this suggestion..."
                    className="min-h-[100px] mt-2"
                    maxLength={1000}
                  />
                  <div className="text-xs text-muted-foreground text-right mt-1">
                    {adminNotes.length}/1000 characters
                  </div>
                </div>
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-2">
                    {getStatusBadge(selectedSuggestion.status)}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateSuggestion("approved")}
                  disabled={isUpdatingSuggestion}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateSuggestion("rejected")}
                  disabled={isUpdatingSuggestion}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateSuggestion("reviewing")}
                  disabled={isUpdatingSuggestion}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Mark Reviewing
                </Button>
              </div>
              <Button variant="outline" onClick={closeSuggestionModal}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </App>
  );
}
