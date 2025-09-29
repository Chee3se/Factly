import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
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
    // Get first letter of name for fallback
    const getInitials = (name: string) => {
        return name
            ? name.split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : '?';
    };

    // Get avatar URL similar to profile page
    const getAvatarUrl = (avatar?: string): string | null => {
        if (!avatar) return null;
        return `/storage/${avatar}`;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch(difficulty) {
            case 'easy': return 'bg-gradient-to-r from-green-500 to-green-600';
            case 'medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
            case 'hard': return 'bg-gradient-to-r from-red-500 to-red-600';
            default: return 'bg-gradient-to-r from-blue-500 to-blue-600';
        }
    };

    if (gameState.phase === 'question' && gameState.currentQuestionData) {
        return (
            <div className="space-y-6 flex-1">
                <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-6">
                            <Badge className={`${getDifficultyColor(gameState.currentQuestionData.difficulty)} text-white font-bold px-3 py-1 shadow-lg`}>
                                {gameState.currentQuestionData.difficulty.toUpperCase()} • {gameState.currentQuestionData.points} pts
                            </Badge>
                            <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Clock className="w-4 h-4 text-blue-300" />
                                <span className="text-sm font-medium text-blue-300">Question Mode</span>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="mb-8 text-center">
                            <h3 className="text-xl md:text-2xl font-bold text-yellow-400 drop-shadow-lg leading-relaxed">
                                {gameState.currentQuestionData.question}
                            </h3>
                        </div>

                        {/* Answer Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gameState.currentQuestionData.options.map((option, index) => {
                                const playersWhoSelected = getPlayersWhoSelectedAnswer(index);
                                const isSelected = gameState.selectedAnswer === index;
                                const optionLetter = String.fromCharCode(65 + index);

                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="lg"
                                        onClick={() => onSelectAnswer(index)}
                                        className={`group relative p-6 h-auto text-left justify-start transition-all duration-300 ${
                                            isSelected
                                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-400 transform scale-105 shadow-xl'
                                                : 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40 hover:scale-[1.02]'
                                        }`}
                                        disabled={gameState.hasAnswered}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* Option Letter */}
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                                                    isSelected
                                                        ? 'bg-black/20 text-black'
                                                        : 'bg-white/10 text-white group-hover:bg-white/20'
                                                }`}>
                                                    {optionLetter}
                                                </div>

                                                {/* Option Text */}
                                                <span className="font-medium text-base leading-relaxed">
                                                    {option}
                                                </span>
                                            </div>

                                            {/* Players who selected this answer */}
                                            {playersWhoSelected.length > 0 && (
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <div className="flex -space-x-2">
                                                        {playersWhoSelected.slice(0, 3).map((player, playerIndex) => (
                                                            <Avatar key={player.id} className="w-10 h-10 shadow-md">
                                                                <AvatarImage
                                                                    src={getAvatarUrl(player.avatar) || undefined}
                                                                    alt={player.name}
                                                                />
                                                                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                                    {getInitials(player.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {playersWhoSelected.length > 3 && (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-md">
                                                                <span className="text-xs font-bold text-white">
                                                                    +{playersWhoSelected.length - 3}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="bg-black/20 text-white border-none text-xs">
                                                        {playersWhoSelected.length}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selection indicator */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle className="w-5 h-5 text-black fill-current" />
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

    if (gameState.phase === 'results' && gameState.currentQuestionData) {
        const isCorrect = gameState.selectedAnswer === gameState.currentQuestionData.correctAnswer;
        const correctAnswerLetter = String.fromCharCode(65 + gameState.currentQuestionData.correctAnswer);

        return (
            <Card className="bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center space-y-6">
                    {/* Results Header */}
                    <div className="flex items-center justify-center space-x-3">
                        {isCorrect ? (
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        ) : (
                            <XCircle className="w-8 h-8 text-red-400" />
                        )}
                        <h2 className="text-3xl font-black text-white drop-shadow-lg">
                            Results
                        </h2>
                    </div>

                    {/* Correct Answer Display */}
                    <div className="space-y-4">
                        <p className="text-lg text-gray-200">
                            The correct answer was:
                        </p>
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-lg">
                            <span className="font-bold text-xl">
                                {correctAnswerLetter}) {gameState.currentQuestionData.options[gameState.currentQuestionData.correctAnswer]}
                            </span>
                        </div>
                    </div>

                    {/* User Result */}
                    <div className="space-y-2">
                        {isCorrect ? (
                            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 rounded-lg p-4">
                                <p className="text-green-400 font-bold text-lg">
                                    🎉 Correct! You earned {gameState.currentQuestionData.points} cubes!
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 rounded-lg p-4">
                                <p className="text-red-400 font-bold text-lg">
                                    {gameState.selectedAnswer !== null ? '❌ Wrong answer!' : '⏰ Time\'s up!'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Loading indicator */}
                    <div className="flex items-center justify-center space-x-3 mt-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                        <p className="text-sm text-blue-300 font-medium">Updating scores...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
};
