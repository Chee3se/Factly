import { useState, useRef, useEffect } from "react";
import { useLobby } from "@/hooks/useLobby";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

export default function LobbyChat({
                                      auth,
                                      lobbyHook
                                  }: {
    auth: Auth;
    lobbyHook: ReturnType<typeof useLobby>;
}) {
    const { messages, sendMessage } = lobbyHook;
    const [msg, setMsg] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (msg.trim()) {
            sendMessage(msg.trim());
            setMsg("");
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-96">
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((message: Message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    message.user_id === auth.user?.id ? "flex-row-reverse" : ""
                                }`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.user.avatar} />
                                    <AvatarFallback>
                                        {message.user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className={`max-w-[70%] ${
                                    message.user_id === auth.user?.id ? "text-right" : ""
                                }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium">
                                            {message.user.name}
                                            {message.user_id === auth.user?.id && (
                                                <span className="text-muted-foreground ml-1">(You)</span>
                                            )}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(message.created_at)}
                                        </span>
                                    </div>

                                    <div className={`px-3 py-2 rounded-lg break-words ${
                                        message.user_id === auth.user?.id
                                            ? "bg-primary text-primary-foreground ml-auto"
                                            : "bg-muted"
                                    }`}>
                                        {message.message}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                <Input
                    type="text"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    maxLength={500}
                />
                <Button type="submit" disabled={!msg.trim()} size="sm">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
