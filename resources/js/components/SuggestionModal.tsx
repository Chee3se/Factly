import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lightbulb, Send, X } from "lucide-react";
import axios from "axios";

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: Auth;
}

const TITLE_MIN = 3;
const TITLE_MAX = 100;
const DESC_MIN = 10;
const DESC_MAX = 500;

export default function SuggestionModal({
  isOpen,
  onClose,
  auth,
}: SuggestionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validate = (): boolean => {
    const next: { title?: string; description?: string } = {};
    const t = title.trim();
    const d = description.trim();

    if (!t) next.title = "Title is required.";
    else if (t.length < TITLE_MIN)
      next.title = `Title must be at least ${TITLE_MIN} characters.`;
    else if (t.length > TITLE_MAX)
      next.title = `Title may not be longer than ${TITLE_MAX} characters.`;

    if (!d) next.description = "Description is required.";
    else if (d.length < DESC_MIN)
      next.description = `Description must be at least ${DESC_MIN} characters.`;
    else if (d.length > DESC_MAX)
      next.description = `Description may not be longer than ${DESC_MAX} characters.`;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await axios.post("/suggestions", {
        title: title.trim(),
        description: description.trim(),
      });

      toast.success("Thank you! Your suggestion has been submitted.");
      setTitle("");
      setDescription("");
      setErrors({});
      onClose();
    } catch (error: any) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors || {};
        setErrors({
          title: serverErrors.title?.[0],
          description: serverErrors.description?.[0],
        });
      } else if (error.response?.status === 401) {
        toast.error("Please log in to submit a suggestion.");
      } else {
        toast.error(
          error.response?.data?.error ||
            "Failed to submit suggestion. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setDescription("");
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Suggest a Game
          </DialogTitle>
          <DialogDescription className="text-base">
            Have an idea for a new game? Share your suggestion with us!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-medium">
              Game Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="What's your game called?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
              maxLength={TITLE_MAX}
              disabled={isSubmitting}
              className="w-full"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/{TITLE_MAX} characters
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your game idea - how it works, what makes it fun, rules, etc..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((p) => ({ ...p, description: undefined }));
              }}
              maxLength={DESC_MAX}
              disabled={isSubmitting}
              className="min-h-[120px] resize-none"
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/{DESC_MAX} characters
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
