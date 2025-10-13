import App from "@/layouts/App";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { route } from "ziggy-js";
import { Loader2, Sparkles, Pencil, Eraser, Trash2, Send } from "lucide-react";
import axios from "axios";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

interface Props {
  auth: Auth;
  word: string;
  gameSlug: string;
  bestScore: number;
}

type GamePhase =
  | "instructions"
  | "drawing"
  | "conversation"
  | "result"
  | "save_artwork";

export default function CuratorsTest({
  auth,
  word,
  gameSlug,
  bestScore: initialBestScore,
}: Props) {
  const [phase, setPhase] = useState<GamePhase>("instructions");
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationOver, setConversationOver] = useState(false);
  const [verdict, setVerdict] = useState<"accepted" | "rejected" | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [messageCount, setMessageCount] = useState(0);
  const [artworkData, setArtworkData] = useState<string | null>(null);
  const [savedArtworks, setSavedArtworks] = useState<any[]>([]);
  const [isSavingArtwork, setIsSavingArtwork] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [newMessageIds, setNewMessageIds] = useState<Set<number | string>>(
    new Set(),
  );

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAvatarUrl = (avatar?: string): string | undefined => {
    if (!avatar) return undefined;
    return `/storage/${avatar}`;
  };

  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
  ];

  useEffect(() => {
    const currentMessageCount = messages.length;
    const newMessagesCount = currentMessageCount - previousMessageCount;

    if (newMessagesCount > 0 && previousMessageCount > 0) {
      const newestMessages = messages.slice(-newMessagesCount);
      const newIds = new Set(
        newestMessages.map(
          (msg: Message, idx) =>
            `${msg.role}-${currentMessageCount - newMessagesCount + idx}`,
        ),
      );

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

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase === "save_artwork") {
      loadSavedArtworks(word)
        .then((artworks) => {
          setSavedArtworks(artworks);
        })
        .catch((error) => {
          console.error("Failed to load saved artworks:", error);
        });
    }
  }, [phase, word]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    lastPosRef.current = { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    lastPosRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startConversation = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      setArtworkData(dataURL);
    }

    setPhase("conversation");

    const systemPrompt = `You are the AI Curator of the "Museum of Human Genius." Someone has submitted artwork claiming to be human-made. Your job is to evaluate if it shows real human creativity, emotion, and authenticity.

The artwork is supposed to be: "${word}"

Guidelines:
- Ask about their creative process, inspiration, and intentions
- Look for evidence of human emotion, imperfection, and genuine thought
- Be skeptical but fair - authenticity over perfection
- Ask 1-2 meaningful questions at a time before deciding
- After questions, give a final verdict: either ACCEPT or REJECT the artwork
- Start your verdict message with "VERDICT: ACCEPT" or "VERDICT: REJECT"

IMPORTANT: Keep ALL responses very short and conversational. Never write more than 3-4 sentences. Be brief and direct. Ask one question at a time. Make it easy for the artist to respond and negotiate. Focus on genuine human qualities.`;

    setMessages([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "assistant",
        content: `Hi there! I'm the curator at the Museum of Human Genius. You've submitted a piece about "${word}".

To see if this really captures human creativity, tell me what inspired you to draw "${word}" this way. What were you feeling while you created it?`,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessageCount(messageCount + 1);

    const newMessages = [
      ...messages,
      {
        role: "user" as const,
        content: userMessage,
        created_at: new Date().toISOString(),
      },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await (window as any).axios.post(
        route("games.curators-test.chat"),
        {
          messages: newMessages,
          artwork_subject: word,
          artwork_data: artworkData,
        },
      );

      const assistantMessage = response.data.message;
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: assistantMessage,
          created_at: new Date().toISOString(),
        },
      ]);

      // Check for verdict
      if (
        assistantMessage.includes("VERDICT: ACCEPT") ||
        assistantMessage.includes("VERDICT: REJECT")
      ) {
        setConversationOver(true);
        const accepted = assistantMessage.includes("VERDICT: ACCEPT");
        setVerdict(accepted ? "accepted" : "rejected");

        // Calculate score: base 50 for acceptance, bonus for fewer messages (more convincing)
        if (accepted) {
          const bonusPoints = Math.max(0, 50 - messageCount * 5);
          const finalScore = 50 + bonusPoints;
          setScore(finalScore);
          saveScore(finalScore);
        } else {
          setScore(0);
          saveScore(0);
        }

        setTimeout(() => {
          setPhase("result");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble processing your response. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveScore = async (finalScore: number) => {
    if (!auth.user) return;
    try {
      const response = await (window as any).axios.post(
        route("games.save-score"),
        {
          game: gameSlug,
          score: finalScore,
          user_id: auth.user.id,
        },
      );
      setBestScore(Math.max(bestScore, response.data.best_score));
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  const restart = () => {
    window.location.reload();
  };

  if (phase === "instructions") {
    return (
      <App auth={auth} title="The Curator's Test">
        <div className="max-w-3xl mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-3xl flex items-center justify-center gap-2">
                <Sparkles className="w-8 h-8" />
                The Curator's Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg text-muted-foreground">
                  Welcome to the Museum of Human Genius
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <p>
                  You are an artist seeking to have your work displayed in the
                  most prestigious museum in the world. But there's a catch...
                </p>
                <p>
                  The museum is guarded by an AI Curator who must verify that
                  your artwork is truly human-made. In an age where machines can
                  create art, the Curator must ensure only genuine human
                  creativity enters these halls.
                </p>
                <p className="font-semibold">How to play:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>You'll be given a random word to draw</li>
                  <li>Create your artwork using the drawing tools</li>
                  <li>
                    Engage in a conversation with the AI Curator, defending your
                    work
                  </li>
                  <li>
                    Convince the Curator of your humanity through your arguments
                    and passion
                  </li>
                </ol>
                <p className="text-muted-foreground italic">
                  The Curator will ask you questions about your creative
                  process, your intentions, and what makes your art uniquely
                  human. Answer thoughtfully and passionately!
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={() => setPhase("drawing")} size="lg">
                  Begin the Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </App>
    );
  }

  if (phase === "drawing") {
    return (
      <App auth={auth} title="The Curator's Test">
        <div className="max-w-4xl mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Draw: <span className="text-primary">{word}</span>
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Create your artwork. Express your humanity through your drawing.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center justify-center">
                <div className="flex gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        brushColor === color
                          ? "border-primary scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <Pencil className="w-4 h-4" />
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm">{brushSize}px</span>
                </div>

                <Button
                  onClick={clearCanvas}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </div>

              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
                />
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={startConversation} size="lg">
                  Submit to the Curator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </App>
    );
  }

  if (phase === "conversation") {
    return (
      <App auth={auth} title="The Curator's Test">
        <div className="max-w-5xl mx-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Artwork</CardTitle>
                <p className="text-sm text-muted-foreground">"{word}"</p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-gray-300 rounded-lg w-full h-[400px] flex items-center justify-center bg-gray-50">
                  {artworkData ? (
                    <img
                      src={artworkData}
                      alt="Your submitted artwork"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <p className="text-muted-foreground text-center">
                      Your artwork has been submitted to the Curator for
                      evaluation.
                      <br />
                      The conversation will begin below.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Conversation with The Curator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative h-[400px] rounded">
                <div
                  className="absolute inset-0"
                  onMouseEnter={() => (document.body.style.overflow = "hidden")}
                  onMouseLeave={() => (document.body.style.overflow = "")}
                >
                  <ScrollArea
                    ref={scrollAreaRef}
                    className="h-full pr-4"
                    onScrollCapture={handleScroll}
                    onWheel={handleWheel}
                  >
                    <div className="space-y-3 p-1 pb-16">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages
                          .filter(
                            (m) =>
                              m.role !== "system" &&
                              !m.content.includes("VERDICT:"),
                          )
                          .map((message, index) => (
                            <div
                              key={index}
                              className={`flex gap-3 items-start w-full ${
                                message.role === "user"
                                  ? "flex-row-reverse"
                                  : ""
                              }`}
                            >
                              <Avatar
                                className="h-8 w-8 flex-shrink-0"
                                decoration={
                                  message.role === "user"
                                    ? (auth.user?.decoration ?? undefined)
                                    : undefined
                                }
                              >
                                <AvatarImage
                                  src={
                                    message.role === "user"
                                      ? getAvatarUrl(auth.user?.avatar)
                                      : undefined
                                  }
                                  alt={
                                    message.role === "user"
                                      ? auth.user?.name
                                      : "The Curator"
                                  }
                                />
                                <AvatarFallback className="bg-muted">
                                  {message.role === "user" ? (
                                    <span className="text-sm font-medium">
                                      {auth.user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                  ) : (
                                    <Sparkles className="h-4 w-4" />
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              <div
                                className={`flex-1 min-w-0 max-w-[calc(100%-4rem)] ${
                                  message.role === "user" ? "text-right" : ""
                                }`}
                              >
                                <div
                                  className={`flex items-center gap-2 mb-1 ${
                                    message.role === "user"
                                      ? "flex-row-reverse"
                                      : ""
                                  }`}
                                >
                                  <span className="text-sm font-medium">
                                    {message.role === "user"
                                      ? `${auth.user?.name} (You)`
                                      : "The Curator"}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {message.created_at
                                      ? formatTime(message.created_at)
                                      : ""}
                                  </span>
                                </div>

                                <div
                                  className={`inline-block max-w-[80%] px-3 py-2 rounded-lg break-words overflow-wrap-anywhere hyphens-auto ${
                                    message.role === "user"
                                      ? "bg-primary text-primary-foreground ml-auto"
                                      : "bg-muted"
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                      {isLoading && (
                        <div className="flex gap-3 items-start w-full">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-muted">
                              <Sparkles className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                The Curator
                              </span>
                            </div>
                            <div className="inline-block max-w-[80%] px-3 py-2 rounded-lg bg-muted">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {!isAtBottom && (
                    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAtBottom(true);
                          scrollToBottom();
                        }}
                        className="text-xs bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 shadow-lg"
                      >
                        Scroll to bottom
                      </Button>
                    </div>
                  )}

                  {!conversationOver ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      className="absolute bottom-0 left-0 right-0 flex gap-2 p-2 bg-background border-t flex-shrink-0"
                    >
                      <Input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Defend your humanity..."
                        disabled={isLoading}
                        className="flex-1"
                        maxLength={500}
                      />
                      <Button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-background border-t text-center flex-shrink-0">
                      <p className="text-sm text-muted-foreground">
                        The Curator is rendering their verdict...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </App>
    );
  }

  if (phase === "result") {
    return (
      <App auth={auth} title="The Curator's Test">
        <div className="max-w-3xl mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle
                className={`text-center text-3xl ${
                  verdict === "accepted" ? "text-green-600" : "text-red-600"
                }`}
              >
                {verdict === "accepted" ? "🎨 Accepted!" : "❌ Rejected"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <p className="text-5xl font-bold">{score}</p>
                <p className="text-muted-foreground">points</p>
              </div>

              {verdict === "accepted" ? (
                <div className="space-y-2">
                  <p className="text-lg">
                    Congratulations! Your artwork has been accepted into the
                    Museum of Human Genius.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The Curator was convinced by your passion and authenticity.
                    You proved your humanity through {messageCount} exchanges.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg">
                    The Curator was not convinced of your artwork's human
                    authenticity.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Don't give up! Try again and speak more passionately about
                    your creative process.
                  </p>
                </div>
              )}

              <p className="text-lg">
                Best Score: <span className="font-bold">{bestScore}</span>
              </p>

              <Button onClick={() => setPhase("save_artwork")} size="lg">
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </App>
    );
  }

  if (phase === "save_artwork") {
    return (
      <App auth={auth} title="The Curator's Test">
        <div className="max-w-4xl mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Save Your Artwork?
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Would you like to save your artwork for others to see? Your
                score: {score}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="border-2 border-gray-300 rounded-lg w-full max-w-md h-64 flex items-center justify-center bg-gray-50">
                  {artworkData ? (
                    <img
                      src={artworkData}
                      alt="Your artwork"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <p className="text-muted-foreground">No artwork to save</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={async () => {
                    setIsSavingArtwork(true);
                    try {
                      await saveArtwork(
                        artworkData!,
                        word,
                        score,
                        auth.user!.id,
                      );
                      alert("Artwork saved successfully!");
                    } catch (error) {
                      alert("Failed to save artwork");
                    } finally {
                      setIsSavingArtwork(false);
                    }
                  }}
                  disabled={isSavingArtwork || !artworkData}
                  size="lg"
                >
                  {isSavingArtwork ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Artwork
                </Button>
                <Button onClick={restart} variant="outline" size="lg">
                  Don't Save
                </Button>
              </div>

              {savedArtworks.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-center mb-4">
                    <a
                      href="/games/curators-test/gallery"
                      className="text-primary hover:text-primary/80 underline text-sm"
                    >
                      View Full Gallery →
                    </a>
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-4">
                    Other Artworks for "{word}"
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedArtworks.map((artwork, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center">
                            <img
                              src={artwork.artwork_data}
                              alt={`Artwork by ${artwork.user_name}`}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{artwork.user_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Score: {artwork.score}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </App>
    );
  }

  return null;
}

async function saveArtwork(
  artworkData: string,
  word: string,
  score: number,
  userId: number,
) {
  try {
    const routeUrl = route("games.curators-test.save-artwork");
    console.log("Saving artwork to:", routeUrl);
    console.log("Artwork data length:", artworkData.length);

    const response = await (window as any).axios.post(routeUrl, {
      artwork_data: artworkData,
      subject: word,
      score: score,
      user_id: userId,
    });

    console.log("Save artwork response:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error saving artwork:", error);
    console.error("Error response:", error.response);
    throw error;
  }
}

async function loadSavedArtworks(word: string) {
  try {
    const routeUrl = route("games.curators-test.artworks");
    console.log("Loading artworks from:", routeUrl, "with subject:", word);

    const response = await (window as any).axios.get(routeUrl, {
      params: { subject: word },
    });

    console.log("Loaded artworks:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error loading artworks:", error);
    console.error("Error response:", error.response);
    throw error;
  }
}
