import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {GameState} from "@/types/quizladder";

interface QuestionAreaProps {
    gameState: GameState;
    onSelectAnswer: (answerIndex: number) => void;
    getPlayersWhoSelectedAnswer: (answerIndex: number) => any[];
}

export const QuestionArea: React.FC<QuestionAreaProps> = ({
                                                              gameState,
                                                              onSelectAnswer,
                                                              getPlayersWhoSelectedAnswer
                                                          }) => {
    if (gameState.phase === 'question' && gameState.currentQuestionData) {
        return (
            <div className="space-y-4 flex-1">
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <Badge className={`${
                            gameState.currentQuestionData.difficulty === 'easy' ? 'bg-green-500' :
                                gameState.currentQuestionData.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        } text-white font-bold`}>
                            {gameState.currentQuestionData.difficulty.toUpperCase()} - {gameState.currentQuestionData.points} pts
                        </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-6 text-yellow-400 drop-shadow-lg">
                        {gameState.currentQuestionData.question}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {gameState.currentQuestionData.options.map((option, index) => {
                            const playersWhoSelected = getPlayersWhoSelectedAnswer(index);
                            const isSelected = gameState.selectedAnswer === index;

                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="lg"
                                    onClick={() => onSelectAnswer(index)}
                                    className={`p-4 text-left justify-start border-2 transition-all duration-200 font-bold relative ${
                                        isSelected
                                            ? 'bg-yellow-400 text-black border-yellow-400 transform scale-105 shadow-lg'
                                            : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
                                    }`}
                                    disabled={gameState.hasAnswered}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <span className="mr-3 font-black">
                                                {String.fromCharCode(65 + index)})
                                            </span>
                                            <span className="flex-1">{option}</span>
                                        </div>
                                        {playersWhoSelected.length > 0 && (
                                            <div className="flex -space-x-2 ml-2">
                                                {playersWhoSelected.slice(0, 3).map((player, playerIndex) => (
                                                    <img
                                                        key={player.id}
                                                        src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                                                        alt={player.name}
                                                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                        title={player.name}
                                                    />
                                                ))}
                                                {playersWhoSelected.length > 3 && (
                                                    <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center">
                                                        <span className="text-xs font-bold text-white">+{playersWhoSelected.length - 3}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (gameState.phase === 'results' && gameState.currentQuestionData) {
        return (
            <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-white/20 text-center">
                <div className="text-3xl font-black mb-4 drop-shadow-lg text-green-400">
                    Results
                </div>
                <p className="text-lg mb-2">
                    The correct answer was: <span className="font-bold text-yellow-400">
                        {String.fromCharCode(65 + gameState.currentQuestionData.correctAnswer)}) {gameState.currentQuestionData.options[gameState.currentQuestionData.correctAnswer]}
                    </span>
                </p>
                {gameState.selectedAnswer === gameState.currentQuestionData.correctAnswer ? (
                    <p className="text-green-400 font-bold">
                        Correct! +{gameState.currentQuestionData.points} cubes!
                    </p>
                ) : (
                    <p className="text-red-400 font-bold">
                        {gameState.selectedAnswer !== null ? 'Wrong answer!' : 'Time\'s up!'}
                    </p>
                )}
                <p className="text-sm text-gray-300 mt-4">Updating scores...</p>
            </div>
        );
    }

    return null;
};
