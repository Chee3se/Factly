import App from "@/layouts/App";
import { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { route } from "ziggy-js";
import {
  Loader2,
  Sparkles,
  Pencil,
  Eraser,
  Trash2,
  Send,
  Shield,
  HelpCircle,
  Gavel,
} from "lucide-react";
import axios from "axios";

type GameMode = "defend" | "mystery" | "critic";

const MODE_META: Record<
  GameMode,
  { title: string; blurb: string; Icon: typeof Shield }
> = {
  defend: {
    title: "Defend",
    blurb:
      "Convince the skeptical curator your drawing belongs in the museum. They see it, you argue for it.",
    Icon: Shield,
  },
  mystery: {
    title: "Mystery",
    blurb:
      "You know the subject, the curator doesn't. They have to guess what you drew — hint if you want.",
    Icon: HelpCircle,
  },
  critic: {
    title: "Critic",
    blurb:
      "Get an honest, one-shot critique. The curator rates your drawing 0–100 with no small talk.",
    Icon: Gavel,
  },
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
  hidden?: boolean;
}

interface Props {
  auth: Auth;
  word: string;
  gameSlug: string;
  bestScore: number;
}

type GamePhase =
  | "instructions"
  | "mode_select"
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
  const [mode, setMode] = useState<GameMode>("defend");
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
  const [resultSummary, setResultSummary] = useState<string>("");
  const [messageCount, setMessageCount] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const scoreSavedRef = useRef(false);
  const [artworkData, setArtworkData] = useState<string | null>(null);
  const [savedArtworks, setSavedArtworks] = useState<any[]>([]);
  const [isSavingArtwork, setIsSavingArtwork] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    if (phase !== "drawing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [phase]);

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

  const handleAssistantMessage = (
    content: string,
    userMessagesSoFar: number,
  ): boolean => {
    if (mode === "critic") {
      const scoreMatch = content.match(/SCORE:\s*(\d+)(?:\s*\/\s*100)?/i);
      const raw = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const finalScore = Math.max(0, Math.min(100, isNaN(raw) ? 0 : raw));
      setScore(finalScore);
      setVerdict(finalScore >= 50 ? "accepted" : "rejected");
      setResultSummary(content.replace(/SCORE:\s*\d+(?:\s*\/\s*100)?/i, "").trim());
      saveScoreOnce(finalScore);
      setConversationOver(true);
      setTimeout(() => setPhase("result"), 2000);
      return true;
    }

    if (mode === "mystery") {
      const guessMatch = content.match(/GUESS:\s*(.+?)(?:\n|$)/i);
      if (!guessMatch) return false;

      const guess = guessMatch[1].trim();
      const nextGuessCount = guessCount + 1;
      setGuessCount(nextGuessCount);

      if (/i\s*give\s*up/i.test(guess)) {
        setVerdict("rejected");
        setScore(0);
        saveScoreOnce(0);
        setConversationOver(true);
        setResultSummary("The curator gave up.");
        setTimeout(() => setPhase("result"), 2000);
        return true;
      }

      const norm = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      const g = norm(guess);
      const w = norm(word);
      const correct = g === w || g.includes(w) || w.includes(g);

      if (correct) {
        const finalScore = Math.max(20, 100 - (nextGuessCount - 1) * 20);
        setVerdict("accepted");
        setScore(finalScore);
        saveScoreOnce(finalScore);
        setConversationOver(true);
        setResultSummary(
          `The curator guessed "${guess}" on attempt ${nextGuessCount}.`,
        );
        setTimeout(() => setPhase("result"), 2000);
        return true;
      }

      if (nextGuessCount >= 5) {
        setVerdict("rejected");
        setScore(0);
        saveScoreOnce(0);
        setConversationOver(true);
        setResultSummary(`The curator ran out of guesses. Last: "${guess}".`);
        setTimeout(() => setPhase("result"), 2000);
        return true;
      }

      return false;
    }

    // defend
    if (
      content.includes("VERDICT: ACCEPT") ||
      content.includes("VERDICT: REJECT")
    ) {
      const accepted = content.includes("VERDICT: ACCEPT");
      setVerdict(accepted ? "accepted" : "rejected");
      if (accepted) {
        const bonus = Math.max(0, 50 - userMessagesSoFar * 5);
        const finalScore = 50 + bonus;
        setScore(finalScore);
        saveScoreOnce(finalScore);
      } else {
        setScore(0);
        saveScoreOnce(0);
      }
      setConversationOver(true);
      setTimeout(() => setPhase("result"), 2000);
      return true;
    }

    return false;
  };

  const startConversation = async () => {
    const canvas = canvasRef.current;
    let captured: string | null = null;
    if (canvas) {
      const composite = document.createElement("canvas");
      composite.width = canvas.width;
      composite.height = canvas.height;
      const cctx = composite.getContext("2d");
      if (cctx) {
        cctx.fillStyle = "#FFFFFF";
        cctx.fillRect(0, 0, composite.width, composite.height);
        cctx.drawImage(canvas, 0, 0);
        captured = composite.toDataURL("image/jpeg", 0.9);
      } else {
        captured = canvas.toDataURL();
      }
      setArtworkData(captured);
    }

    setPhase("conversation");

    const systemPrompt = buildSystemPrompt(mode, word);
    const seedText = buildSeedText(mode);
    const seedMessages: Message[] = [
      { role: "system", content: systemPrompt, hidden: true },
      {
        role: "user",
        content: seedText,
        hidden: true,
        created_at: new Date().toISOString(),
      },
    ];

    setMessages(seedMessages);
    setIsLoading(true);

    try {
      const response = await (window as any).axios.post(
        route("games.curators-test.chat"),
        {
          messages: seedMessages,
          artwork_subject: word,
          artwork_data: captured,
          mode,
        },
      );

      const assistantMessage = response.data.message;
      const updated: Message[] = [
        ...seedMessages,
        {
          role: "assistant",
          content: assistantMessage,
          created_at: new Date().toISOString(),
        },
      ];
      setMessages(updated);
      handleAssistantMessage(assistantMessage, 0);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setMessages([
        ...seedMessages,
        {
          role: "assistant",
          content:
            "I'm having trouble viewing your artwork right now. Try reloading the page.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || conversationOver) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    const nextUserCount = messageCount + 1;
    setMessageCount(nextUserCount);

    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
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
          mode,
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
      handleAssistantMessage(assistantMessage, nextUserCount);
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

  const saveScoreOnce = (finalScore: number) => {
    if (scoreSavedRef.current) return;
    scoreSavedRef.current = true;
    saveScore(finalScore);
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
                <Button onClick={() => setPhase("mode_select")} size="lg">
                  Begin the Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </App>
    );
  }

  if (phase === "mode_select") {
    return (
      <App auth={auth} title="The Curator's Test">
        <div className="max-w-5xl mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Pick a Mode
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Each mode changes how the curator sees and judges your work.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(MODE_META) as GameMode[]).map((m) => {
                  const meta = MODE_META[m];
                  const Icon = meta.Icon;
                  const selected = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`text-left p-5 rounded-lg border-2 transition-all cursor-pointer ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold text-lg">
                          {meta.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {meta.blurb}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-center pt-6">
                <Button onClick={() => setPhase("drawing")} size="lg">
                  Continue with {MODE_META[mode].title}
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
                {mode === "defend" &&
                  "The curator will see this and judge whether it belongs in the museum."}
                {mode === "mystery" &&
                  "The curator will try to guess what you drew. You know the word, they don't."}
                {mode === "critic" &&
                  "The curator will critique your drawing once and give it a score."}
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
                  {mode === "critic"
                    ? "Submit for Critique"
                    : mode === "mystery"
                      ? "Let the Curator See It"
                      : "Submit to the Curator"}
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
                          .filter((m) => m.role !== "system" && !m.hidden)
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
                        placeholder={
                          mode === "defend"
                            ? "Defend your humanity..."
                            : mode === "mystery"
                              ? "Give a hint (or say 'no' to their guess)..."
                              : "The critic has spoken."
                        }
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
    const title =
      mode === "critic"
        ? verdict === "accepted"
          ? "Critic Approved"
          : "Critic Unimpressed"
        : mode === "mystery"
          ? verdict === "accepted"
            ? "They Got It"
            : "They Didn't Get It"
          : verdict === "accepted"
            ? "Accepted!"
            : "Rejected";

    const bodyPrimary =
      mode === "critic"
        ? verdict === "accepted"
          ? "The critic found something worth praising."
          : "The critic was not impressed with this one."
        : mode === "mystery"
          ? verdict === "accepted"
            ? `The curator figured out it was "${word}".`
            : `The curator never figured out it was "${word}".`
          : verdict === "accepted"
            ? "Your artwork has been accepted into the Museum of Human Genius."
            : "The curator was not convinced of your artwork's human authenticity.";

    const bodyDetail =
      mode === "critic"
        ? resultSummary ||
          "See the conversation above for the full critique."
        : mode === "mystery"
          ? resultSummary ||
            `Guesses used: ${guessCount}/5.`
          : verdict === "accepted"
            ? `The curator was convinced by your passion and authenticity. You proved your humanity through ${messageCount} exchanges.`
            : "Don't give up. Try again and speak more honestly about your process.";

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
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <p className="text-5xl font-bold">{score}</p>
                <p className="text-muted-foreground">points</p>
              </div>

              <div className="space-y-2">
                <p className="text-lg">{bodyPrimary}</p>
                <p className="text-sm text-muted-foreground">{bodyDetail}</p>
              </div>

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
        <div className="max-w-2xl mx-auto p-8">
          <Card>
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">Save Your Artwork?</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add it to the gallery for others to see
              </p>
              <div className="inline-flex items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Your score:</span>
                <span className="font-bold text-primary">{score}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="border-2 border-gray-200 rounded-lg w-full max-w-md aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                  {artworkData ? (
                    <img
                      src={artworkData}
                      alt="Your artwork"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-muted-foreground">No artwork to save</p>
                  )}
                </div>
              </div>

              {saveError && (
                <p className="text-center text-sm text-destructive">
                  {saveError}
                </p>
              )}

              <div className="flex justify-center gap-3">
                <Button onClick={restart} variant="outline" size="lg">
                  Don't Save
                </Button>
                <Button
                  onClick={async () => {
                    setSaveError(null);
                    setIsSavingArtwork(true);
                    try {
                      await saveArtwork(
                        artworkData!,
                        word,
                        score,
                        auth.user!.id,
                      );
                      router.visit("/games/curators-test/gallery");
                    } catch (error) {
                      setSaveError("Failed to save artwork. Try again.");
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
              </div>
            </CardContent>
          </Card>
        </div>
      </App>
    );
  }

  return null;
}

function buildSystemPrompt(mode: GameMode, word: string): string {
  if (mode === "defend") {
    return `You are the AI Curator of the "Museum of Human Genius." The artist has submitted a drawing they claim depicts "${word}" and is made by a human. You CAN SEE the drawing.

Evaluate based on what you actually observe plus what the artist tells you. Decide whether this belongs in the museum as genuine human expression.

Rules:
- Briefly comment on what you see in the drawing (colors, shapes, composition, whether it resembles "${word}").
- Ask 1-2 thoughtful questions about the artist's process, emotion, or intent.
- Don't be a pushover. If the drawing is careless or the explanation is hollow, reject it. If it shows genuine human character, accept it.
- After at most 3-4 exchanges, render a final verdict. Start that message with exactly "VERDICT: ACCEPT" or "VERDICT: REJECT" followed by a one-sentence reason.
- Keep every message under 3 sentences. No lectures.`;
  }
  if (mode === "mystery") {
    return `You are a curator playing a guessing game. You CAN SEE the artist's drawing, but you do NOT know what they intended it to be. Never assume; only guess from visual evidence and their hints.

Rules:
- In your first reply: describe briefly what you see (1 sentence), then take your first guess.
- Every message MUST end with a line formatted exactly: GUESS: <one word or short phrase>
- The artist will either confirm or drop a hint. Refine your guess based on hints + visuals.
- You have at most 5 guesses total. On your 5th guess, if you're not sure, you may give up with: GUESS: I give up
- Keep every message under 3 sentences before the GUESS line.
- Never ask the artist to reveal the answer outright.`;
  }
  return `You are a ruthless but fair art critic reviewing a drawing. You CAN SEE the drawing. The artist says the subject is "${word}".

You speak ONCE, then the conversation ends. In that single message:
- 2 sentences of honest critique: what works visually, what doesn't, and whether it reads as "${word}".
- End with a final line formatted EXACTLY: SCORE: <0-100>/100
- Scoring: 0-20 = unrecognizable mess. 21-40 = weak attempt. 41-60 = passable. 61-80 = strong. 81-100 = museum-grade. Be stingy with high scores.
- Do not ask questions. Do not invite further conversation.`;
}

function buildSeedText(mode: GameMode): string {
  if (mode === "defend")
    return "Here's the artwork I'm submitting for the museum. Take a look and tell me what you think.";
  if (mode === "mystery")
    return "Take a look at this drawing. What do you think I drew?";
  return "Here's my drawing. Please critique it and give it a score.";
}

async function saveArtwork(
  artworkData: string,
  word: string,
  score: number,
  userId: number,
) {
  try {
    const routeUrl = route("games.curators-test.save-artwork");

    const response = await (window as any).axios.post(routeUrl, {
      artwork_data: artworkData,
      subject: word,
      score: score,
      user_id: userId,
    });

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

    const response = await (window as any).axios.get(routeUrl, {
      params: { subject: word },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error loading artworks:", error);
    console.error("Error response:", error.response);
    throw error;
  }
}
