import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle } from "lucide-react";
import { GameState } from "@/types/quizladder";

interface QuestionAreaProps {
  gameState: GameState;
  onSelectAnswer: (answerIndex: number) => void;
  getPlayersWhoSelectedAnswer: (answerIndex: number) => any[];
}

export const QuestionArea: React.FC<QuestionAreaProps> = ({
  gameState,
  onSelectAnswer,
  getPlayersWhoSelectedAnswer,
}) => {
  const getInitials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  const getAvatarUrl = (avatar?: string): string | null =>
    avatar ? `/storage/${avatar}` : null;

  const difficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "hard":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (gameState.phase === "question" && gameState.currentQuestionData) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${difficultyStyle(
              gameState.currentQuestionData.difficulty,
            )}`}
          >
            {gameState.currentQuestionData.difficulty} ·{" "}
            {gameState.currentQuestionData.points} pts
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-semibold leading-relaxed text-center">
          {gameState.currentQuestionData.question}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gameState.currentQuestionData.options.map((option, index) => {
            const playersWhoSelected = getPlayersWhoSelectedAnswer(index);
            const isSelected = gameState.selectedAnswer === index;
            const optionLetter = String.fromCharCode(65 + index);

            return (
              <button
                key={index}
                onClick={() => onSelectAnswer(index)}
                disabled={gameState.hasAnswered}
                className={`group relative p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-background border-border/60 hover:border-foreground/40 disabled:opacity-60 disabled:hover:border-border/60"
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span className="font-medium text-sm leading-snug">
                      {option}
                    </span>
                  </div>

                  {playersWhoSelected.length > 0 && (
                    <div className="flex -space-x-2 flex-shrink-0">
                      {playersWhoSelected.slice(0, 3).map((player) => (
                        <Avatar
                          key={player.id}
                          className="w-7 h-7 ring-2 ring-background"
                          decoration={player.decoration}
                        >
                          <AvatarImage
                            src={getAvatarUrl(player.avatar) || undefined}
                            alt={player.name}
                          />
                          <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {playersWhoSelected.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            +{playersWhoSelected.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isSelected && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (gameState.phase === "results" && gameState.currentQuestionData) {
    const isCorrect =
      gameState.selectedAnswer === gameState.currentQuestionData.correctAnswer;
    const correctAnswerLetter = String.fromCharCode(
      65 + gameState.currentQuestionData.correctAnswer,
    );

    return (
      <div className="py-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          {isCorrect ? (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
          <h2 className="text-xl font-bold">
            {isCorrect
              ? `+${gameState.currentQuestionData.points} points`
              : gameState.selectedAnswer !== null
                ? "Wrong answer"
                : "Time's up"}
          </h2>
        </div>

        <div className="inline-block px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">
            Correct
          </span>
          <span className="font-semibold">
            {correctAnswerLetter}){" "}
            {
              gameState.currentQuestionData.options[
                gameState.currentQuestionData.correctAnswer
              ]
            }
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
          <span>Updating scores…</span>
        </div>
      </div>
    );
  }

  return null;
};
