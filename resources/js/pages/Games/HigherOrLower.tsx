import React, { useState, useEffect } from 'react';

import { HigherOrLowerItem } from "@/types";

import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import App from "@/layouts/App";
import {Button} from "@/components/ui/button";

interface Props {
    auth: Auth;
    items: HigherOrLowerItem[];
}

interface GameState {
    currentIndex: number;
    score: number;
    gamePhase: 'guessing' | 'revealing' | 'result';
    guess: 'higher' | 'lower' | null;
    isCorrect: boolean | null;
    animatingValue: number;
    showCurrentDescription: boolean;
    showNextDescription: boolean;
}

export default function HigherOrLower({auth, items}: Props) {
    const [gameState, setGameState] = useState<GameState>({
        currentIndex: 0,
        score: 0,
        gamePhase: 'guessing',
        guess: null,
        isCorrect: null,
        animatingValue: 0,
        showCurrentDescription: false,
        showNextDescription: false
    });

    const currentItem = items?.[gameState.currentIndex];
    const nextItem = items?.[gameState.currentIndex + 1];

    // Handle guess
    const makeGuess = (guess: 'higher' | 'lower') => {
        if (!currentItem || !nextItem) return;

        setGameState(prev => ({
            ...prev,
            guess,
            gamePhase: 'revealing',
            animatingValue: 0,
            showCurrentDescription: false,
            showNextDescription: false
        }));
    };

    // Toggle description visibility
    const toggleCurrentDescription = () => {
        setGameState(prev => ({
            ...prev,
            showCurrentDescription: !prev.showCurrentDescription
        }));
    };

    const toggleNextDescription = () => {
        setGameState(prev => ({
            ...prev,
            showNextDescription: !prev.showNextDescription
        }));
    };

    // Animate the number reveal
    useEffect(() => {
        if (gameState.gamePhase === 'revealing') {
            const targetValue = nextItem?.value || 0;
            const duration = 2000;
            const steps = 60;
            const increment = targetValue / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                const newValue = Math.min(currentStep * increment, targetValue);

                setGameState(prev => ({
                    ...prev,
                    animatingValue: Math.floor(newValue)
                }));

                if (currentStep >= steps) {
                    clearInterval(interval);

                    const isCorrect = gameState.guess === 'higher'
                        ? targetValue > (currentItem?.value || 0)
                        : targetValue < (currentItem?.value || 0);

                    setGameState(prev => ({
                        ...prev,
                        gamePhase: 'result',
                        isCorrect,
                        score: isCorrect ? prev.score + 1 : prev.score,
                        animatingValue: targetValue
                    }));
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }
    }, [gameState.gamePhase, gameState.guess, currentItem?.value, nextItem?.value]);

    // Continue to next round
    const nextRound = () => {
        if (gameState.currentIndex + 1 >= items.length - 1) {
            // Game over - reset to start
            setGameState({
                currentIndex: 0,
                score: 0,
                gamePhase: 'guessing',
                guess: null,
                isCorrect: null,
                animatingValue: 0,
                showCurrentDescription: false,
                showNextDescription: false
            });
        } else {
            setGameState(prev => ({
                ...prev,
                currentIndex: prev.currentIndex + 1,
                gamePhase: 'guessing',
                guess: null,
                isCorrect: null,
                animatingValue: 0,
                showCurrentDescription: false,
                showNextDescription: false
            }));
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    if (!items || items.length < 2) {
        return (
            <App title={'Higher or Lower'} auth={auth}>
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Not enough items</h2>
                        <p>You need at least 2 items to play Higher or Lower!</p>
                    </div>
                </div>
            </App>
        );
    }

    return (
        <App title={'Higher or Lower'} auth={auth}>
            <div className="h-[80vh] grid grid-cols-2 relative overflow-hidden">
                {/* Current Item */}
                <div className="relative flex flex-col items-center justify-center h-full">
                    {/* Background image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url("${currentItem?.image_url}")` }}
                    ></div>

                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black opacity-50"></div>

                    {/* Score */}
                    <div className="absolute top-4 left-4 text-left z-20">
                        <div className="text-2xl font-black text-yellow-400 drop-shadow-lg">
                            SCORE: {gameState.score}
                        </div>
                    </div>

                    {/* Info Button */}
                    <button
                        onClick={toggleCurrentDescription}
                        className="absolute top-4 right-4 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
                    >
                        <Info size={20} className="text-white" />
                    </button>

                    <div className="relative z-10 text-center text-white p-4">
                        <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">{currentItem?.name}</h3>
                        <div className="text-5xl font-black mb-2 text-yellow-400 drop-shadow-lg">
                            {formatNumber(currentItem?.value || 0)} kWh
                        </div>

                        {/* Manual description toggle */}
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

                {/* Next Item */}
                <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
                    {/* Background image */}
                    {nextItem?.image_url ? (
                        <img
                            src={nextItem.image_url}
                            alt={nextItem.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                                console.log('Failed to load next item image:', nextItem.image_url);
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-800"></div>
                    )}

                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black opacity-50"></div>

                    {/* Info Button */}
                    {gameState.gamePhase !== 'guessing' && (
                        <button
                            onClick={toggleNextDescription}
                            className="absolute top-4 right-4 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
                        >
                            <Info size={20} className="text-white" />
                        </button>
                    )}

                    <div className="relative z-10 text-center text-white p-4">
                        <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">{nextItem?.name}</h3>
                        <div className="text-5xl font-black mb-2 text-yellow-400 drop-shadow-lg">
                            {gameState.gamePhase === 'guessing'
                                ? '???'
                                : formatNumber(gameState.animatingValue)
                            } kWh
                        </div>

                        {/* Manual description toggle only */}
                        {gameState.showNextDescription && gameState.gamePhase !== 'guessing' && (
                            <div className="animate-fade-in transition-all duration-300 ease-in-out mt-4 mb-6">
                                <div className="bg-gradient-to-r from-green-900/90 to-teal-900/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-2xl max-w-md mx-auto">
                                    <p className="text-sm font-medium text-white leading-relaxed">
                                        {nextItem?.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Game Controls */}
                        {gameState.gamePhase === 'guessing' && (
                            <div className="flex flex-col space-y-4 mt-6">
                                <p className="text-lg mb-3 font-semibold drop-shadow-lg">Is the energy consumption higher or lower?</p>
                                <div className="flex space-x-4 justify-center">
                                    <Button
                                        size="lg"
                                        onClick={() => makeGuess('higher')}
                                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-base"
                                    >
                                        <TrendingUp size={24} />
                                        <span>HIGHER</span>
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={() => makeGuess('lower')}
                                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-base"
                                    >
                                        <TrendingDown size={24} />
                                        <span>LOWER</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {gameState.gamePhase === 'result' && (
                            <div className="flex flex-col space-y-3 mt-2">
                                <div className={`text-2xl font-bold drop-shadow-lg rounded-full w-10 h-10 m-1 pt-1 mx-auto mb-4 ${
                                    gameState.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                }`}>
                                    {gameState.isCorrect ? '✓' : '×'}
                                </div>
                                <Button
                                    size="lg"
                                    onClick={nextRound}
                                    className="px-6 w-fit mx-auto py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-base"
                                >
                                    {gameState.currentIndex + 1 >= items.length - 1 ? 'Again ↺' : 'Next →'}
                                </Button>
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
