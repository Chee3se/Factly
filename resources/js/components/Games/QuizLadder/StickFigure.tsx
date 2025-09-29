import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    const progressPercentage = (playerState.cubes / winningCubes) * 100;

    // Get first letter of name for fallback
    const getInitials = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // Get avatar URL similar to other components
    const getAvatarUrl = (avatar?: string): string | null => {
        if (!avatar) return null;
        return `/storage/${avatar}`;
    };

    return (
        <div className="flex flex-col items-center relative group">
            {/* Profile Avatar */}
            <div className="relative mb-4 p-1">
                <div className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
                    isCurrentUser
                        ? 'drop-shadow-lg scale-110'
                        : 'group-hover:scale-105'
                }`}>
                    <Avatar className="w-full h-full">
                        <AvatarImage
                            src={getAvatarUrl(player?.avatar) || undefined}
                            alt={player?.name || 'Player'}
                            className="object-cover object-center"
                        />
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                            {getInitials(player?.name)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Current user indicator - removed */}
            </div>

            {/* Player Info Card */}
            <div className={`bg-gradient-to-br ${isCurrentUser ? 'from-yellow-400/20 to-orange-500/20 border-yellow-400/50' : 'from-blue-500/20 to-purple-600/20 border-blue-400/50'} backdrop-blur-sm border rounded-lg p-3 min-w-[100px] transition-all duration-300 group-hover:scale-105 shadow-lg`}>
                {/* Player Name */}
                <div className={`text-sm font-bold text-center mb-3 px-3 py-2 rounded-md ${
                    isCurrentUser
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                        : 'bg-white/10 text-white border border-white/20'
                }`}>
                    {player?.name || 'Unknown'}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="w-full bg-black/30 rounded-full h-3 border border-white/20">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isCurrentUser
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                    : 'bg-gradient-to-r from-blue-400 to-purple-500'
                            }`}
                            style={{ width: `${Math.min(100, progressPercentage)}%` }}
                        />
                    </div>
                </div>

                {/* Cubes Visualization - Modern blocks */}
                <div className="flex justify-center mb-3">
                    <div className="grid grid-cols-4 gap-1 max-h-10 overflow-hidden">
                        {Array.from({ length: Math.min(16, Math.ceil(playerState.cubes / 2)) }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-2.5 h-2.5 rounded-sm ${
                                    isCurrentUser
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                        : 'bg-gradient-to-br from-blue-400 to-purple-500'
                                } shadow-sm animate-pulse`}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    animationDuration: '2s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Cubes Count */}
                <div className={`text-center text-sm font-bold px-3 py-2 rounded-md ${
                    isCurrentUser
                        ? 'bg-black/20 text-yellow-300 border border-yellow-400/30'
                        : 'bg-black/20 text-blue-300 border border-blue-400/30'
                }`}>
                    {playerState.cubes}/{winningCubes}
                </div>
            </div>

            {/* Classic Cubes Stack */}
            <div className="flex flex-col-reverse items-center min-h-[20px] mt-3">
                {cubes.map((_, index) => (
                    <div
                        key={index}
                        className={`w-10 h-4 border border-white/30 mb-0.5 shadow-sm transition-all duration-300 rounded-sm ${
                            isCurrentUser ? 'bg-yellow-400/80 hover:bg-yellow-300 border-yellow-400/50' : 'bg-blue-400/80 hover:bg-blue-300 border-blue-400/50'
                        }`}
                        style={{
                            transform: `translateY(${index * -0.5}px)`,
                            animationDelay: `${index * 0.1}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
