import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { CheckCircle, XCircle, Clock, Settings, Calendar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { AdminSuggestion, PaginatedData } from "@/types/admin";

interface SuggestionsTabProps {
  suggestions: PaginatedData<AdminSuggestion>;
  onUpdateSuggestions: (
    updater: (
      prev: PaginatedData<AdminSuggestion>,
    ) => PaginatedData<AdminSuggestion>,
  ) => void;
}

export default function SuggestionsTab({
  suggestions,
  onUpdateSuggestions,
}: SuggestionsTabProps) {
  // Suggestion management state
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AdminSuggestion | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdatingSuggestion, setIsUpdatingSuggestion] = useState(false);

  // Suggestion management functions
  const openSuggestionModal = (suggestion: AdminSuggestion) => {
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
        // Update local state
        onUpdateSuggestions((prev) => ({
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

  const getStatusBadge = (status: string | undefined) => {
    const safeStatus = status || "pending";
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
      statusConfig[safeStatus as keyof typeof statusConfig] ||
      statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </Badge>
    );
  };

  return (
    <>
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
                      <div className="font-medium">{suggestion.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
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

      {/* Suggestion Review Modal */}
      <Dialog open={showSuggestionModal} onOpenChange={setShowSuggestionModal}>
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
    </>
  );
}
