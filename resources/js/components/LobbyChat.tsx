import { useState, useRef, useEffect } from "react";
import { useLobby } from "@/hooks/useLobby";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

export default function LobbyChat({
  auth,
  lobbyHook,
  isDarkTheme = false,
  isCompact = false,
}: {
  auth: Auth;
  lobbyHook: ReturnType<typeof useLobby>;
  isDarkTheme?: boolean;
  isCompact?: boolean;
}) {
  const { messages, sendMessage } = lobbyHook;
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageIds, setNewMessageIds] = useState<Set<number | string>>(
    new Set(),
  );
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e: React.UIEvent) => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const threshold = 50;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if (
      (e.deltaY > 0 && atBottom) ||
      (e.deltaY < 0 && atTop) ||
      scrollHeight > clientHeight
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseEnter = () => {
    document.body.style.overflow = "hidden";
  };

  const handleMouseLeave = () => {
    document.body.style.overflow = "";
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const currentMessageCount = messages.length;
    const newMessagesCount = currentMessageCount - previousMessageCount;

    if (newMessagesCount > 0 && previousMessageCount > 0) {
      const newestMessages = messages.slice(-newMessagesCount);
      const newIds = new Set(newestMessages.map((msg: Message) => msg.id));

      setNewMessageIds(newIds);

      setTimeout(() => {
        setNewMessageIds(new Set());
      }, 400);
    }

    setPreviousMessageCount(currentMessageCount);

    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (msg.trim()) {
      sendMessage(msg.trim(), auth.user);
      setMsg("");
      setTimeout(() => {
        setIsAtBottom(true);
        scrollToBottom();
      }, 100);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAvatarUrl = (avatar?: string): string | null => {
    if (!avatar) return null;
    return `/storage/${avatar}`;
  };

  // Theme-aware classes
  const getThemeClasses = () => {
    if (isDarkTheme) {
      return {
        text: "text-white",
        mutedText: "text-gray-300",
        ownMessage: "bg-blue-500/80 text-white",
        otherMessage: "bg-white/10 text-white border-white/20",
        input:
          "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
        scrollButton:
          "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white",
        avatarFallback: "bg-white/20 text-white",
      };
    }
    return {
      text: "text-foreground",
      mutedText: "text-muted-foreground",
      ownMessage: "bg-primary text-primary-foreground",
      otherMessage: "bg-muted text-foreground",
      input: "bg-background border-border text-foreground",
      scrollButton:
        "bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90",
      avatarFallback: "bg-muted text-muted-foreground",
    };
  };

  const theme = getThemeClasses();
  const containerHeight = isCompact ? "h-64" : "h-96";
  const avatarSize = isCompact ? "h-6 w-6" : "h-8 w-8";
  const messageSpacing = isCompact ? "space-y-2" : "space-y-3";
  const messagePadding = isCompact ? "px-2 py-1" : "px-3 py-2";
  const textSize = isCompact ? "text-sm" : "";

  return (
    <div
      className={`flex flex-col ${containerHeight} rounded relative`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 pr-4 scroll-area-container"
        onScrollCapture={handleScroll}
        onWheel={handleWheel}
      >
        <div className={`${messageSpacing} p-1`}>
          {messages.length === 0 ? (
            <div className={`text-center py-8 ${theme.mutedText} ${textSize}`}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex gap-${isCompact ? "2" : "3"} items-start w-full ${
                  message.user_id === auth.user?.id ? "flex-row-reverse" : ""
                } ${
                  newMessageIds.has(String(message.id))
                    ? message.user_id === auth.user?.id
                      ? "message-enter-own"
                      : "message-enter-other"
                    : ""
                }`}
              >
                <Avatar className={`${avatarSize} flex-shrink-0`}>
                  <AvatarImage
                    src={getAvatarUrl(message.user.avatar) || undefined}
                    alt={message.user.name}
                  />
                  <AvatarFallback className={theme.avatarFallback}>
                    {message.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 min-w-0 max-w-[calc(100%-4rem)] ${
                    message.user_id === auth.user?.id ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 mb-1 ${
                      message.user_id === auth.user?.id
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <span
                      className={`${isCompact ? "text-xs" : "text-sm"} font-medium truncate ${theme.text}`}
                    >
                      {message.user.name}
                      {message.user_id === auth.user?.id && (
                        <span className={`${theme.mutedText} ml-1`}>(You)</span>
                      )}
                    </span>
                    <span
                      className={`${isCompact ? "text-xs" : "text-xs"} ${theme.mutedText} flex-shrink-0`}
                    >
                      {formatTime(message.created_at)}
                    </span>
                  </div>

                  <div
                    className={`inline-block max-w-[80%] ${messagePadding} rounded-lg break-words overflow-wrap-anywhere hyphens-auto ${textSize} ${
                      message.user_id === auth.user?.id
                        ? `${theme.ownMessage} ml-auto`
                        : theme.otherMessage
                    } ${isDarkTheme && message.user_id !== auth.user?.id ? "border" : ""}`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {!isAtBottom && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAtBottom(true);
              scrollToBottom();
            }}
            className={`text-xs ${theme.scrollButton} shadow-lg`}
          >
            Scroll to bottom
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`flex gap-2 ${isCompact ? "mt-3" : "mt-4"} flex-shrink-0`}
      >
        <Input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          className={`flex-1 ${theme.input} ${textSize}`}
          maxLength={500}
        />
        <Button
          type="submit"
          disabled={!msg.trim()}
          size="sm"
          className={
            isDarkTheme
              ? "bg-blue-500/80 hover:bg-blue-500 border-blue-400/50"
              : ""
          }
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
