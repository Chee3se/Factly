import React, { useState, useEffect } from "react";
import { HigherOrLowerItem } from "@/types";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import App from "@/layouts/App";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { route } from "ziggy-js";

interface Props {
  auth: Auth;
  items: HigherOrLowerItem[];
  gameSlug: string;
  bestScore?: number;
}

interface GameState {
  currentIndex: number;
  score: number;
  gamePhase: "guessing" | "revealing" | "result" | "game-over";
  guess: "higher" | "lower" | null;
  isCorrect: boolean | null;
  animatingValue: number;
  showCurrentDescription: boolean;
  showNextDescription: boolean;
  bestScore: number;
}

export default function HigherOrLower({
  auth,
  items,
  gameSlug,
  bestScore = 0,
}: Props) {
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledItems, setShuffledItems] = useState(() => shuffleArray(items));
  const [gameState, setGameState] = useState<GameState>({
    currentIndex: 0,
    score: 0,
    gamePhase: "guessing",
    guess: null,
    isCorrect: null,
    animatingValue: 0,
    showCurrentDescription: false,
    showNextDescription: false,
    bestScore: bestScore,
  });

  const currentItem = shuffledItems?.[gameState.currentIndex];
  const nextItem = shuffledItems?.[gameState.currentIndex + 1];

  const formatEnergyValue = (kWh: number) => {
    if (kWh >= 1000000000) {
      return `${(kWh / 1000000000).toFixed(2)} TWh`;
    } else if (kWh >= 1000000) {
      return `${(kWh / 1000000).toFixed(2)} GWh`;
    } else if (kWh >= 1000) {
      return `${(kWh / 1000).toFixed(2)} MWh`;
    } else {
      return `${kWh.toLocaleString()} kWh`;
    }
  };

  const saveScore = async (finalScore: number) => {
    if (!auth?.user) return;

    try {
      const response = await axios.post(route("games.save-score"), {
        game: gameSlug,
        score: finalScore,
        user_id: auth.user.id,
      });

      if (response.data.success) {
        setGameState((prev) => ({
          ...prev,
          bestScore: Math.max(prev.bestScore, response.data.best_score),
        }));
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  const makeGuess = (guess: "higher" | "lower") => {
    if (!currentItem || !nextItem) return;

    setGameState((prev) => ({
      ...prev,
      guess,
      gamePhase: "revealing",
      animatingValue: 0,
      showCurrentDescription: false,
      showNextDescription: false,
    }));
  };

  const toggleCurrentDescription = () => {
    setGameState((prev) => ({
      ...prev,
      showCurrentDescription: !prev.showCurrentDescription,
    }));
  };

  const toggleNextDescription = () => {
    setGameState((prev) => ({
      ...prev,
      showNextDescription: !prev.showNextDescription,
    }));
  };

  useEffect(() => {
    if (gameState.gamePhase === "revealing") {
      const targetValue = nextItem?.value || 0;
      const duration = 2000;
      const steps = 60;
      const increment = targetValue / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newValue = Math.min(currentStep * increment, targetValue);

        setGameState((prev) => ({
          ...prev,
          animatingValue: Math.floor(newValue),
        }));

        if (currentStep >= steps) {
          clearInterval(interval);

          const isCorrect =
            gameState.guess === "higher"
              ? targetValue > (currentItem?.value || 0)
              : targetValue < (currentItem?.value || 0);

          setGameState((prev) => ({
            ...prev,
            gamePhase: "result",
            isCorrect,
            score: isCorrect ? prev.score + 1 : prev.score,
            animatingValue: targetValue,
          }));

          if (!isCorrect) {
            saveScore(gameState.score);
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                gamePhase: "game-over",
              }));
            }, 1500);
          }
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [
    gameState.gamePhase,
    gameState.guess,
    currentItem?.value,
    nextItem?.value,
  ]);

  const nextRound = () => {
    if (gameState.currentIndex + 1 >= shuffledItems.length - 1) {
      saveScore(gameState.score);
      setGameState({
        currentIndex: 0,
        score: 0,
        gamePhase: "game-over",
        guess: null,
        isCorrect: null,
        animatingValue: 0,
        showCurrentDescription: false,
        showNextDescription: false,
        bestScore: Math.max(gameState.bestScore, gameState.score),
      });
    } else {
      setGameState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        gamePhase: "guessing",
        guess: null,
        isCorrect: null,
        animatingValue: 0,
        showCurrentDescription: false,
        showNextDescription: false,
      }));
    }
  };

  const restartGame = () => {
    setShuffledItems(shuffleArray(items));
    setGameState((prev) => ({
      currentIndex: 0,
      score: 0,
      gamePhase: "guessing",
      guess: null,
      isCorrect: null,
      animatingValue: 0,
      showCurrentDescription: false,
      showNextDescription: false,
      bestScore: prev.bestScore,
    }));
  };

  if (!shuffledItems || shuffledItems.length < 2) {
    return (
      <App title={"Higher or Lower"} auth={auth}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Not enough items</h2>
            <p>You need at least 2 items to play Higher or Lower!</p>
          </div>
        </div>
      </App>
    );
  }

  if (gameState.gamePhase === "game-over") {
    return (
      <App title={"Higher or Lower - Game Over"} auth={auth}>
        <div className="h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center text-white p-8 bg-black/50 rounded-2xl backdrop-blur-sm border border-white/20 max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-red-400">Game Over!</h1>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-lg text-gray-300">Your Score</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {gameState.score}
                </p>
              </div>

              {auth?.user && (
                <div>
                  <p className="text-lg text-gray-300">Best Score</p>
                  <p className="text-3xl font-bold text-green-400">
                    {gameState.bestScore}
                  </p>
                  {gameState.score > gameState.bestScore && (
                    <p className="text-sm text-yellow-300 animate-pulse">
                      🎉 New Personal Best! 🎉
                    </p>
                  )}
                </div>
              )}

              {!auth?.user && (
                <p className="text-sm text-gray-400">
                  Sign in to save your scores!
                </p>
              )}
            </div>

            <Button
              size="lg"
              onClick={restartGame}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-lg"
            >
              Play Again
            </Button>
          </div>
        </div>
      </App>
    );
  }

  return (
    <App title={"Higher or Lower"} auth={auth}>
      <div className="h-[80vh] grid grid-cols-2 relative overflow-hidden">
        <div className="relative flex flex-col items-center justify-center h-full">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${currentItem?.image_url}")` }}
          ></div>
          <div className="absolute inset-0 bg-black opacity-50"></div>

          <div className="absolute top-4 left-4 text-left z-20">
            <div className="text-2xl font-black text-yellow-400 drop-shadow-lg mb-1">
              STREAK: {gameState.score}
            </div>
            {auth?.user && gameState.bestScore > 0 && (
              <div className="text-lg font-bold text-green-400 drop-shadow-lg">
                BEST: {gameState.bestScore}
              </div>
            )}
          </div>

          <button
            onClick={toggleCurrentDescription}
            className="absolute top-4 right-4 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
          >
            <Info size={20} className="text-white" />
          </button>

          <div className="relative z-10 text-center text-white p-4">
            <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">
              {currentItem?.name}
            </h3>
            <div className="text-5xl font-black mb-2 text-yellow-400 drop-shadow-lg">
              {formatEnergyValue(currentItem?.value || 0)}
            </div>

            {gameState.showCurrentDescription && (
              <div className="animate-fade-in transition-all duration-300 ease-in-out mt-4">
                <div className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-2xl max-w-md mx-auto">
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {currentItem?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
          {nextItem?.image_url ? (
            <img
              src={nextItem.image_url}
              alt={nextItem.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800"></div>
          )}

          <div className="absolute inset-0 bg-black opacity-50"></div>

          {gameState.gamePhase !== "guessing" && (
            <button
              onClick={toggleNextDescription}
              className="absolute top-4 right-4 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
            >
              <Info size={20} className="text-white" />
            </button>
          )}

          <div className="relative z-10 text-center text-white p-4">
            <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">
              {nextItem?.name}
            </h3>
            <div className="text-5xl font-black mb-2 text-yellow-400 drop-shadow-lg">
              {gameState.gamePhase === "guessing"
                ? "???"
                : formatEnergyValue(gameState.animatingValue)}
            </div>

            {gameState.showNextDescription &&
              gameState.gamePhase !== "guessing" && (
                <div className="animate-fade-in transition-all duration-300 ease-in-out mt-4 mb-6">
                  <div className="bg-gradient-to-r from-green-900/90 to-teal-900/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-2xl max-w-md mx-auto">
                    <p className="text-sm font-medium text-white leading-relaxed">
                      {nextItem?.description}
                    </p>
                  </div>
                </div>
              )}

            {gameState.gamePhase === "guessing" && (
              <div className="flex flex-col space-y-4 mt-6">
                <p className="text-lg mb-3 font-semibold drop-shadow-lg">
                  Is the energy consumption higher or lower?
                </p>
                <div className="flex space-x-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => makeGuess("higher")}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-base"
                  >
                    <TrendingUp size={24} />
                    <span>HIGHER</span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => makeGuess("lower")}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-base"
                  >
                    <TrendingDown size={24} />
                    <span>LOWER</span>
                  </Button>
                </div>
              </div>
            )}

            {gameState.gamePhase === "result" && gameState.isCorrect && (
              <div className="flex flex-col space-y-3 mt-2">
                <div className="text-2xl font-bold drop-shadow-lg rounded-full w-10 h-10 m-1 pt-1 mx-auto mb-4 bg-green-500">
                  ✓
                </div>
                <Button
                  size="lg"
                  onClick={nextRound}
                  className="px-6 w-fit mx-auto py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-base"
                >
                  {gameState.currentIndex + 1 >= shuffledItems.length - 1
                    ? "Finish Game"
                    : "Next →"}
                </Button>
              </div>
            )}

            {gameState.gamePhase === "result" && !gameState.isCorrect && (
              <div className="flex flex-col space-y-3 mt-2">
                <div className="text-2xl font-bold drop-shadow-lg rounded-full w-10 h-10 m-1 pt-1 mx-auto mb-4 bg-red-500">
                  ×
                </div>
                <p className="text-lg font-semibold text-red-300 drop-shadow-lg mb-2">
                  Wrong! Game Over
                </p>
                <p className="text-sm text-gray-300 mb-4">
                  Final Streak: {gameState.score}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-in-out forwards;
                }
            `}</style>
    </App>
  );
}
