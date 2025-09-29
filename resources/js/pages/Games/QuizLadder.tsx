import React, { useState, useEffect, useCallback, useRef } from "react";
import App from "@/layouts/App";
import { useLobby } from "@/hooks/useLobby";
import { toast } from "sonner";
import background_image from "../../../images/grassy_background.png";
import { GameState, PlayerGameState, Question } from "@/types/quizladder";
import { LoadingScreen } from "@/components/Games/QuizLadder/LoadingScreen";
import { GameOverScreen } from "@/components/Games/QuizLadder/GameOver";
import { GameScreen } from "@/components/Games/QuizLadder/GameScreen";

interface Props {
  auth: Auth;
  game: Game;
  items: any[];
}

const WINNING_CUBES = 100;
const QUESTION_TIME = 30;

const transformDatabaseQuestions = (items: any[]): Question[] => {
  return items.map((item, index) => ({
    id: item.id || index + 1,
    question: item.question,
    options:
      typeof item.options === "string"
        ? JSON.parse(item.options)
        : item.options,
    correctAnswer:
      typeof item.options === "string"
        ? JSON.parse(item.options).indexOf(item.correct_answer)
        : item.options.indexOf(item.correct_answer),
    difficulty: item.difficulty,
    points: item.points,
  }));
};

export default function QuizLadder({ auth, game, items }: Props) {
  const lobbyHook = useLobby(auth.user?.id);
  const {
    currentLobby,
    onlineUsers,
    messages,
    loading,
    leaveLobby,
    sendMessage,
    toggleReady,
    startGame,
    onWhisper,
    sendWhisper,
    offWhisper,
    currentChannel,
  } = lobbyHook;

  const [databaseQuestions] = useState<Question[]>(() =>
    transformDatabaseQuestions(items),
  );

  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    timeLeft: QUESTION_TIME,
    phase: "waiting",
    playerStates: {},
    selectedAnswer: null,
    hasAnswered: false,
    questionStartTime: Date.now(),
    questions: databaseQuestions,
    currentQuestionData: null,
    playerSelections: [],
    isGameOwner: false,
  });

  const whisperListenersRef = useRef<Set<string>>(new Set());
  const gameInitializedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  const authUserIdRef = useRef(auth.user?.id);
  const currentLobbyRef = useRef(currentLobby);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    authUserIdRef.current = auth.user?.id;
  }, [auth.user?.id]);

  useEffect(() => {
    currentLobbyRef.current = currentLobby;
  }, [currentLobby]);

  const cleanupWhisperListeners = useCallback(() => {
    whisperListenersRef.current.forEach((event) => {
      offWhisper(event);
    });
    whisperListenersRef.current.clear();
  }, [offWhisper]);

  const updateScoresBasedOnSelections = useCallback(() => {
    return new Promise<void>((resolve) => {
      setGameState((prev) => {
        if (!prev.currentQuestionData) {
          resolve();
          return prev;
        }

        const correctAnswer = prev.currentQuestionData.correctAnswer;
        const points = prev.currentQuestionData.points;
        const updatedStates = { ...prev.playerStates };

        if (prev.selectedAnswer === correctAnswer && authUserIdRef.current) {
          const currentUserState = updatedStates[authUserIdRef.current];
          if (currentUserState) {
            updatedStates[authUserIdRef.current] = {
              ...currentUserState,
              cubes: Math.min(WINNING_CUBES, currentUserState.cubes + points),
            };
          }
        }

        prev.playerSelections.forEach((selection) => {
          if (selection.answerIndex === correctAnswer) {
            const playerState = updatedStates[selection.userId];
            if (playerState) {
              updatedStates[selection.userId] = {
                ...playerState,
                cubes: Math.min(WINNING_CUBES, playerState.cubes + points),
              };
            }
          }
        });

        if (prev.isGameOwner) {
          sendWhisper("client-score-update", {
            playerStates: updatedStates,
            initiatorId: authUserIdRef.current,
          });
        }

        setTimeout(resolve, 100);
        return { ...prev, playerStates: updatedStates };
      });
    });
  }, [sendWhisper]);

  const checkForWinnerOrContinue = useCallback(() => {
    setGameState((prev) => {
      const winner = Object.values(prev.playerStates).find(
        (state) => state.cubes >= WINNING_CUBES,
      );

      if (winner) {
        const winnerPlayer = currentLobbyRef.current?.players?.find(
          (p) => p.id === winner.userId,
        );

        if (prev.isGameOwner) {
          sendWhisper("client-game-ended", {
            winner: winnerPlayer,
            initiatorId: authUserIdRef.current,
          });
        }

        if (winner.userId === authUserIdRef.current) {
          toast.success("You won the Quiz Ladder!");
        }
        return { ...prev, phase: "finished" };
      }

      if (prev.currentQuestion < prev.questions.length - 1) {
        const nextQuestionIndex = prev.currentQuestion + 1;
        const nextQuestion = prev.questions[nextQuestionIndex];

        if (prev.isGameOwner) {
          setTimeout(() => {
            sendWhisper("client-question-start", {
              questionIndex: nextQuestionIndex,
              questionData: nextQuestion,
              initiatorId: authUserIdRef.current,
            });
          }, 500);
        }

        return {
          ...prev,
          currentQuestion: nextQuestionIndex,
          currentQuestionData: nextQuestion,
          timeLeft: QUESTION_TIME,
          phase: "question",
          selectedAnswer: null,
          hasAnswered: false,
          questionStartTime: Date.now(),
          playerSelections: [],
        };
      } else {
        const topPlayer = Object.values(prev.playerStates).reduce(
          (prev, current) => (prev.cubes > current.cubes ? prev : current),
        );
        const topPlayerData = currentLobbyRef.current?.players?.find(
          (p) => p.id === topPlayer.userId,
        );

        if (prev.isGameOwner) {
          sendWhisper("client-game-ended", {
            winner: topPlayerData,
            initiatorId: authUserIdRef.current,
          });
        }

        return { ...prev, phase: "finished" };
      }
    });
  }, [sendWhisper]);

  const setupWhisperListeners = useCallback(() => {
    if (!currentChannel || !currentChannel.isReady) return;

    const events = [
      "client-player-answered",
      "client-timer-sync",
      "client-question-start",
      "client-question-ended",
      "client-game-ended",
      "client-game-start",
      "client-score-update",
    ];

    events.forEach((event) => {
      if (!whisperListenersRef.current.has(event)) {
        whisperListenersRef.current.add(event);

        switch (event) {
          case "client-game-start":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              const gameQuestions = e.questions || databaseQuestions;
              const firstQuestion = gameQuestions[0];

              setGameState((prev) => ({
                ...prev,
                questions: gameQuestions,
                phase: "question",
                currentQuestionData: firstQuestion,
                questionStartTime: Date.now(),
                timeLeft: QUESTION_TIME,
                hasAnswered: false,
                selectedAnswer: null,
                playerSelections: [],
              }));

              toast.success(
                "Quiz started! Answer as many questions correctly as you can!",
              );
            });
            break;

          case "client-player-answered":
            onWhisper(event, (e: any) => {
              if (e.userId === authUserIdRef.current) return;

              setGameState((prev) => ({
                ...prev,
                playerSelections: [
                  ...prev.playerSelections.filter((s) => s.userId !== e.userId),
                  {
                    userId: e.userId,
                    answerIndex: e.answerIndex,
                    userName: e.userName,
                  },
                ],
              }));
            });
            break;

          case "client-timer-sync":
            onWhisper(event, (e: any) => {
              if (e.initiatorId !== authUserIdRef.current) {
                setGameState((prev) => {
                  if (!prev.isGameOwner && prev.phase === "question") {
                    return { ...prev, timeLeft: e.timeLeft };
                  }
                  return prev;
                });
              }
            });
            break;

          case "client-score-update":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              setGameState((prev) => ({
                ...prev,
                playerStates: e.playerStates,
              }));
            });
            break;

          case "client-question-start":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              const questionData = e.questionData;
              setGameState((prev) => ({
                ...prev,
                phase: "question",
                currentQuestion: e.questionIndex,
                currentQuestionData: questionData,
                timeLeft: QUESTION_TIME,
                questionStartTime: Date.now(),
                selectedAnswer: null,
                hasAnswered: false,
                playerSelections: [],
              }));
              toast.info(`Question ${e.questionIndex + 1} started!`);
            });
            break;

          case "client-question-ended":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              setGameState((prev) => ({ ...prev, phase: "results" }));
            });
            break;

          case "client-game-ended":
            onWhisper(event, (e: any) => {
              setGameState((prev) => ({ ...prev, phase: "finished" }));
              if (e.winner && e.winner.id !== authUserIdRef.current) {
                toast.success(`${e.winner.name} won the Quiz Ladder!`);
              }
            });
            break;
        }
      }
    });
  }, [currentChannel, onWhisper, databaseQuestions]);

  const startQuizGame = useCallback(() => {
    if (gameInitializedRef.current || databaseQuestions.length === 0) return;
    gameInitializedRef.current = true;

    const shuffledQuestions = [...databaseQuestions].sort(
      () => Math.random() - 0.5,
    );
    const gameQuestions = shuffledQuestions.slice(
      0,
      Math.min(10, shuffledQuestions.length),
    );

    const firstQuestion = gameQuestions[0];

    setGameState((prev) => ({
      ...prev,
      questions: gameQuestions,
      phase: "question",
      currentQuestionData: firstQuestion,
      questionStartTime: Date.now(),
      timeLeft: QUESTION_TIME,
      hasAnswered: false,
      selectedAnswer: null,
      playerSelections: [],
    }));

    setTimeout(() => {
      sendWhisper("client-game-start", {
        questions: gameQuestions,
        initiatorId: authUserIdRef.current,
      });
    }, 100);

    toast.success(
      "Quiz started! Answer as many questions correctly as you can!",
    );
  }, [sendWhisper, databaseQuestions]);

  const selectAnswer = useCallback(
    (answerIndex: number) => {
      setGameState((prev) => {
        if (prev.hasAnswered || prev.phase !== "question") return prev;

        if (authUserIdRef.current) {
          const user = auth.user;
          if (user) {
            sendWhisper("client-player-answered", {
              userId: user.id,
              userName: user.name,
              answerIndex: answerIndex,
            });
          }
        }

        return {
          ...prev,
          selectedAnswer: answerIndex,
          hasAnswered: true,
        };
      });
    },
    [sendWhisper, auth.user],
  );

  const endQuestion = useCallback(async () => {
    setGameState((prev) => {
      if (prev.isGameOwner) {
        sendWhisper("client-question-ended", {
          initiatorId: authUserIdRef.current,
        });
      }

      return { ...prev, phase: "results" };
    });

    if (gameStateRef.current.isGameOwner) {
      await updateScoresBasedOnSelections();

      setTimeout(() => {
        checkForWinnerOrContinue();
      }, 2000);
    }
  }, [sendWhisper, updateScoresBasedOnSelections, checkForWinnerOrContinue]);

  const handleLeaveLobby = useCallback(async () => {
    cleanupWhisperListeners();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    await leaveLobby();
    window.location.href = "/lobbies";
  }, [cleanupWhisperListeners, leaveLobby]);

  useEffect(() => {
    if (currentChannel && currentChannel.isReady) {
      setupWhisperListeners();
    }

    return () => {
      cleanupWhisperListeners();
    };
  }, [currentChannel?.isReady, setupWhisperListeners]);

  useEffect(() => {
    if (currentLobby?.players && auth.user?.id) {
      const initialStates: { [userId: number]: PlayerGameState } = {};
      currentLobby.players.forEach((player) => {
        initialStates[player.id] = {
          userId: player.id,
          cubes: 0,
          position: 0,
          hasAnswered: false,
          selectedAnswer: null,
          isReady: player.pivot?.ready || false,
        };
      });

      const isOwner =
        currentLobby.owner_id === auth.user.id ||
        currentLobby.host?.id === auth.user.id;

      setGameState((prev) => ({
        ...prev,
        playerStates: initialStates,
        isGameOwner: isOwner,
        phase: prev.phase === "waiting" ? "waiting" : prev.phase,
      }));

      gameInitializedRef.current = false;
    }
  }, [
    currentLobby?.players,
    currentLobby?.owner_id,
    currentLobby?.host?.id,
    auth.user?.id,
  ]);

  useEffect(() => {
    if (
      currentLobby &&
      gameState.phase === "waiting" &&
      currentChannel?.isReady &&
      gameState.isGameOwner &&
      !gameInitializedRef.current &&
      databaseQuestions.length > 0
    ) {
      timerRef.current = setTimeout(() => {
        startQuizGame();
      }, 2000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [
    currentLobby,
    gameState.phase,
    currentChannel?.isReady,
    gameState.isGameOwner,
    startQuizGame,
    databaseQuestions.length,
  ]);

  useEffect(() => {
    if (
      gameState.phase === "question" &&
      gameState.timeLeft > 0 &&
      gameState.isGameOwner
    ) {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          const newTimeLeft = prev.timeLeft - 1;

          if (newTimeLeft % 3 === 0) {
            sendWhisper("client-timer-sync", {
              timeLeft: newTimeLeft,
              initiatorId: authUserIdRef.current,
            });
          }

          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);

      return () => clearTimeout(timer);
    } else if (
      gameState.timeLeft === 0 &&
      gameState.phase === "question" &&
      gameState.isGameOwner
    ) {
      endQuestion();
    }
  }, [
    gameState.timeLeft,
    gameState.phase,
    gameState.isGameOwner,
    sendWhisper,
    endQuestion,
  ]);

  useEffect(() => {
    if (gameState.phase === "question" && !gameState.isGameOwner) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState.timeLeft, gameState.phase, gameState.isGameOwner]);

  if (databaseQuestions.length === 0) {
    return (
      <LoadingScreen auth={auth}>
        <div className="text-center text-red-500">
          <p>No quiz questions available. Please contact an administrator.</p>
        </div>
      </LoadingScreen>
    );
  }

  if (loading || !currentLobby) {
    return <LoadingScreen auth={auth} />;
  }

  if (gameState.phase === "finished") {
    return (
      <GameOverScreen
        auth={auth}
        currentLobby={currentLobby}
        gameState={gameState}
        onLeaveLobby={handleLeaveLobby}
      />
    );
  }

  return (
    <GameScreen
      auth={auth}
      currentLobby={currentLobby}
      gameState={gameState}
      messages={messages}
      lobbyHook={lobbyHook}
      onSelectAnswer={selectAnswer}
      onLeaveLobby={handleLeaveLobby}
      winningCubes={WINNING_CUBES}
    />
  );
}
