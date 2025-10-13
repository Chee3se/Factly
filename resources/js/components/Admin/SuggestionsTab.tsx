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
import { AdminSuggestion, PaginatedData } from "@/types/admin";
import { Label } from "@/components/ui/label";

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
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AdminSuggestion | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isUpdatingSuggestion, setIsUpdatingSuggestion] = useState(false);

  const openSuggestionModal = (suggestion: AdminSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowSuggestionModal(true);
  };

  const closeSuggestionModal = () => {
    setSelectedSuggestion(null);
    setShowSuggestionModal(false);
  };

  const handleUpdateSuggestion = async (
    status: "pending" | "approved" | "rejected" | "implemented",
  ) => {
    if (!selectedSuggestion) return;

    setIsUpdatingSuggestion(true);
    try {
      const response = await axios.patch(
        `/admin/suggestions/${selectedSuggestion.id}/status`,
        { status },
      );
      if (response.data.success) {
        onUpdateSuggestions((prev) => ({
          ...prev,
          data: prev.data.map((suggestion) =>
            suggestion.id === selectedSuggestion.id
              ? { ...suggestion, status }
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
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.data.map((suggestion) => (
                <TableRow
                  key={suggestion.id}
                  onClick={() => openSuggestionModal(suggestion)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {/* Title truncated */}
                  <TableCell
                    className="font-medium max-w-xs truncate"
                    title={suggestion.title}
                  >
                    {suggestion.title}
                  </TableCell>

                  {/* Description truncated */}
                  <TableCell
                    className="max-w-sm truncate"
                    title={suggestion.description}
                  >
                    {suggestion.description}
                  </TableCell>

                  {/* User Info */}
                  <TableCell>
                    <div>
                      <div className="font-medium">{suggestion.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.user.email}
                      </div>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(suggestion.created_at)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suggestion Review Modal */}
      <Dialog open={showSuggestionModal} onOpenChange={setShowSuggestionModal}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Review Suggestion</DialogTitle>
            <DialogDescription>
              Review and update the status of this game suggestion.
            </DialogDescription>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg break-words whitespace-pre-wrap">
                  {selectedSuggestion.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted by {selectedSuggestion.user.name} on{" "}
                  {formatDate(selectedSuggestion.created_at)}
                </p>
              </div>

              {/* Description wraps downward instead of horizontally */}
              <div>
                <Label>Description</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg overflow-hidden">
                  <p className="text-sm break-words whitespace-pre-wrap overflow-x-hidden">
                    {selectedSuggestion.description}
                  </p>
                </div>
              </div>

              {selectedSuggestion.admin_notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg overflow-hidden">
                    <p className="text-sm break-words whitespace-pre-wrap overflow-x-hidden">
                      {selectedSuggestion.admin_notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeSuggestionModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
