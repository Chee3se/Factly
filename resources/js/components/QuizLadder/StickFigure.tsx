import React from 'react';
import {PlayerGameState} from "@/types/quizladder";

interface StickFigureProps {
    player: any;
    playerState: PlayerGameState;
    isCurrentUser: boolean;
    winningCubes: number;
}

export const StickFigure: React.FC<StickFigureProps> = ({
                                                            player,
                                                            playerState,
                                                            isCurrentUser,
                                                            winningCubes
                                                        }) => {
    const cubeHeight = Math.max(1, Math.floor(playerState.cubes / 5));
    const cubes = Array.from({ length: cubeHeight }, (_, i) => i);

    return (
        <div className="flex flex-col items-center relative">
            {/* Stick Figure */}
            <div className="relative mb-2">
                <svg width="40" height="60" viewBox="0 0 40 60" className={`${isCurrentUser ? 'drop-shadow-lg' : ''}`}>
                    {/* Head with profile picture */}
                    <circle cx="20" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/>
                    {player.avatar ? (
                        <image
                            href={player.avatar}
                            x="12"
                            y="4"
                            width="16"
                            height="16"
                            clipPath="circle(8px at 50% 50%)"
                        />
                    ) : (
                        <circle cx="20" cy="12" r="8" fill="white" />
                    )}
                    {/* Body */}
                    <line x1="20" y1="22" x2="20" y2="40" stroke="white" strokeWidth="2"/>
                    {/* Arms */}
                    <line x1="20" y1="28" x2="10" y2="35" stroke="white" strokeWidth="2"/>
                    <line x1="20" y1="28" x2="30" y2="35" stroke="white" strokeWidth="2"/>
                    {/* Legs */}
                    <line x1="20" y1="40" x2="12" y2="55" stroke="white" strokeWidth="2"/>
                    <line x1="20" y1="40" x2="28" y2="55" stroke="white" strokeWidth="2"/>
                </svg>
                {isCurrentUser && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="text-xs font-bold">★</span>
                    </div>
                )}
            </div>

            {/* Player name */}
            <div className={`text-xs font-bold mb-1 text-center px-2 py-1 rounded truncate max-w-20 ${
                isCurrentUser ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'
            }`}>
                {player.name}
            </div>

            {/* Cubes stack */}
            <div className="flex flex-col-reverse items-center min-h-[20px]">
                {cubes.map((_, index) => (
                    <div
                        key={index}
                        className={`w-8 h-3 border border-white/30 mb-0.5 ${
                            isCurrentUser ? 'bg-yellow-400/80' : 'bg-blue-400/80'
                        } shadow-sm`}
                        style={{
                            transform: `translateY(${index * -0.5}px)`,
                        }}
                    />
                ))}
            </div>

            {/* Cubes count */}
            <div className="text-white font-bold text-sm mt-2 bg-black/50 px-2 py-1 rounded">
                {playerState.cubes}/{winningCubes}
            </div>
        </div>
    );
};
