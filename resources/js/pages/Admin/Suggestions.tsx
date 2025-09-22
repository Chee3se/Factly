import React, { useState } from 'react';
import App from "@/layouts/App";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Eye,
    MessageSquare,
    User,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Settings,
    Lightbulb
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {Suggestion} from "@/types";

interface Props {
    auth: Auth;
    suggestions: {
        data: Suggestion[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Suggestions({ auth, suggestions }: Props) {
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const openModal = (suggestion: Suggestion) => {
        setSelectedSuggestion(suggestion);
        setAdminNotes(suggestion.admin_notes || '');
        setShowModal(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedSuggestion) return;

        setIsUpdating(true);

        try {
            router.patch(`/admin/suggestions/${selectedSuggestion.id}/status`, {
                admin_notes: adminNotes
            }, {
                onSuccess: () => {
                    toast.success('Suggestion updated successfully!');
                    setShowModal(false);
                    setSelectedSuggestion(null);
                },
                onError: () => {
                    toast.error('Failed to update suggestion');
                },
                onFinish: () => {
                    setIsUpdating(false);
                }
            });
        } catch (error) {
            toast.error('An error occurred');
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <App title="Admin - Suggestions" auth={auth}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Lightbulb className="h-8 w-8 text-yellow-500" />
                            Game Suggestions
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Review and manage user suggestions - {suggestions.total} total suggestions
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => router.get('/admin/dashboard')}
                        className="flex items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Dashboard
                    </Button>
                </div>

                {suggestions.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">
                                No suggestions yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                User suggestions will appear here when submitted
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {suggestions.data.map((suggestion) => (
                            <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2 flex items-center gap-2">
                                                {suggestion.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {suggestion.user.name}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(suggestion.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openModal(suggestion)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Review
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {suggestion.description}
                                    </p>

                                    {suggestion.admin_notes && (
                                        <div className="mt-4 p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Admin Notes</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {suggestion.admin_notes}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Review Modal */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Review Suggestion
                            </DialogTitle>
                            <DialogDescription>
                                Update the status and add notes for this suggestion
                            </DialogDescription>
                        </DialogHeader>

                        {selectedSuggestion && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{selectedSuggestion.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        <span>By: {selectedSuggestion.user.name}</span>
                                        <span>Submitted: {formatDate(selectedSuggestion.created_at)}</span>
                                    </div>
                                    <p className="text-sm bg-muted p-4 rounded-lg">
                                        {selectedSuggestion.description}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                                        <Textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes about this suggestion..."
                                            className="min-h-[100px]"
                                            maxLength={1000}
                                        />
                                        <div className="text-xs text-muted-foreground text-right mt-1">
                                            {adminNotes.length}/1000 characters
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </App>
    );
}
