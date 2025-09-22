import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lightbulb, Send, X } from 'lucide-react';
import axios from 'axios';

interface SuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    auth: Auth;
}

export default function SuggestionModal({ isOpen, onClose, auth }: SuggestionModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            toast.error('Please fill in both title and description');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('/suggestions', {
                title: title.trim(),
                description: description.trim(),
            });

            toast.success('Thank you! Your suggestion has been submitted.');
            setTitle('');
            setDescription('');
            onClose();

        } catch (error: any) {
            if (error.response?.status === 422) {
                // Handle validation errors
                const errors = error.response.data.errors;
                if (errors.title) {
                    toast.error(errors.title[0]);
                } else if (errors.description) {
                    toast.error(errors.description[0]);
                } else {
                    toast.error('Please check your input and try again.');
                }
            } else if (error.response?.status === 401) {
                toast.error('Please log in to submit a suggestion.');
            } else {
                toast.error(error.response?.data?.error || 'Failed to submit suggestion. Please try again.');
            }
            console.error('Suggestion submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTitle('');
            setDescription('');
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
                        <Label htmlFor="title" className="text-sm font-medium">Game Title</Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="What's your game called?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            disabled={isSubmitting}
                            className="w-full"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {title.length}/100 characters
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your game idea - how it works, what makes it fun, rules, etc..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            disabled={isSubmitting}
                            className="min-h-[120px] resize-none"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {description.length}/500 characters
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
                            {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
