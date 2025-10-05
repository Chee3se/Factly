import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";
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
  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";
  };

  const getAvatarUrl = (avatar?: string): string | null => {
    if (!avatar) return null;
    return `/storage/${avatar}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  if (gameState.phase === "question" && gameState.currentQuestionData) {
    return (
      <div className="space-y-6 flex-1">
        <Card className="bg-gray-50/80 backdrop-blur-sm border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Badge
                className={`${getDifficultyColor(gameState.currentQuestionData.difficulty)} font-semibold px-2 py-1 border text-sm`}
              >
                {gameState.currentQuestionData.difficulty.toUpperCase()} •{" "}
                {gameState.currentQuestionData.points} pts
              </Badge>
              <div className="flex items-center space-x-2 bg-blue-50 px-2 py-1 rounded-full border border-blue-300">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  Question Mode
                </span>
              </div>
            </div>

            <div className="mb-4 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                {gameState.currentQuestionData.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gameState.currentQuestionData.options.map((option, index) => {
                const playersWhoSelected = getPlayersWhoSelectedAnswer(index);
                const isSelected = gameState.selectedAnswer === index;
                const optionLetter = String.fromCharCode(65 + index);

                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="default"
                    onClick={() => onSelectAnswer(index)}
                    className={`group relative p-4 h-auto text-left justify-start transition-all duration-300 ${
                      isSelected
                        ? "bg-blue-100 text-blue-900 border-blue-400 transform scale-105 shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-400 hover:scale-[1.02]"
                    }`}
                    disabled={gameState.hasAnswered}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3 flex-1">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                            isSelected
                              ? "bg-blue-500 text-white border-blue-400"
                              : "bg-gray-100 text-gray-700 border-gray-300 group-hover:bg-blue-50"
                          }`}
                        >
                          {optionLetter}
                        </div>

                        <span className="font-medium text-sm leading-relaxed">
                          {option}
                        </span>
                      </div>

                      {playersWhoSelected.length > 0 && (
                        <div className="flex items-center space-x-2 ml-4">
                          <div className="flex -space-x-2">
                            {playersWhoSelected.slice(0, 3).map((player) => (
                              <Avatar
                                key={player.id}
                                className="w-10 h-10 shadow-md border-2 border-gray-300"
                              >
                                <AvatarImage
                                  src={getAvatarUrl(player.avatar) || undefined}
                                  alt={player.name}
                                />
                                <AvatarFallback className="text-xs font-bold bg-gray-200 text-gray-700">
                                  {getInitials(player.name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {playersWhoSelected.length > 3 && (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow-md border-2 border-gray-300">
                                <span className="text-xs font-bold text-gray-700">
                                  +{playersWhoSelected.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-gray-200 text-gray-800 border-gray-400 text-xs"
                          >
                            {playersWhoSelected.length}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
      <Card className="bg-gray-50/80 backdrop-blur-sm border-gray-300">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <h2 className="text-2xl font-bold text-gray-800">Results</h2>
          </div>

          <div className="space-y-3">
            <p className="text-base text-gray-600">The correct answer was:</p>
            <div className="bg-green-100 border border-green-300 text-gray-800 px-4 py-3 rounded-lg">
              <span className="font-bold text-lg">
                {correctAnswerLetter}){" "}
                {
                  gameState.currentQuestionData.options[
                    gameState.currentQuestionData.correctAnswer
                  ]
                }
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {isCorrect ? (
              <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                <p className="text-green-700 font-bold text-base">
                  ✓ Correct! You earned {gameState.currentQuestionData.points}{" "}
                  points!
                </p>
              </div>
            ) : (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-700 font-bold text-base">
                  {gameState.selectedAnswer !== null
                    ? "✗ Wrong answer!"
                    : "⏰ Time's up!"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-3 mt-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 font-medium">
              Updating scores...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
