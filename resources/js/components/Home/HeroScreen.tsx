import React, { useState, useRef, useEffect } from "react";
import { ChevronUp, Gamepad2, Users, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroScreenProps {
  onComplete: () => void;
  websiteName?: string;
}

export default function HeroScreen({
  onComplete,
  websiteName = "Factly",
}: HeroScreenProps) {
  const [position, setPosition] = useState(0); // 0 = closed, 100 = fully open
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const startY = useRef(0);
  const startPosition = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientY: number) => {
    if (isAnimating) return;
    setIsDragging(true);
    startY.current = clientY;
    startPosition.current = position;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging || isAnimating) return;

    const deltaY = startY.current - clientY; // Positive when dragging up
    const containerHeight =
      containerRef.current?.offsetHeight || window.innerHeight;
    const dragDistance = (deltaY / containerHeight) * 100;

    const newPosition = Math.max(
      0,
      Math.min(100, startPosition.current + dragDistance),
    );
    setPosition(newPosition);
  };

  const handleEnd = () => {
    setIsDragging(false);

    // If dragged more than 50% up, complete the animation
    if (position > 50) {
      animateOut();
    } else {
      // Snap back down if not dragged enough
      setPosition(0);
    }
  };

  const animateOut = () => {
    setIsAnimating(true);
    setPosition(100);

    // Wait for the CSS transition to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500); // Match the transition duration
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Auto-show animation on mount
  // Auto‑show animation placeholder – can be expanded with a fade‑in later
  useEffect(() => {
    const timer = setTimeout(() => {
      // No console output – removed debug log for production
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, position]);

  // Handle button click to dismiss
  const handleGetStartedClick = () => {
    animateOut();
  };

  if (!isVisible) return null;

  // Position 0 = fully visible, position 100 = completely off-screen (slid up)
  const translateY = `translateY(-${position}%)`;
  const transitionClass = isDragging
    ? ""
    : "transition-transform duration-500 ease-out";

  return (
    <div
      ref={containerRef}
      /* Adjust height to use full viewport while respecting safe‑area insets */
      className={`w-full h-[90vh] pointer-events-auto ${transitionClass}`}
      style={{ transform: translateY }}
    >
      {/* Main Hero Content */}
      <div className="w-full h-full bg-gradient-to-br from-white via-slate-50 to-blue-50 text-slate-900 relative overflow-hidden border-b border-border">
        {/* Cool Background Elements */}
        <div className="absolute inset-0">
          {/* Cool geometric background patterns */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12)_0%,transparent_50%)] bg-[size:40rem_40rem]" />
          <div className="absolute inset-0 bg-[linear-gradient(-45deg,rgba(139,92,246,0.08)_0%,transparent_50%)] bg-[size:60rem_60rem]" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* Content - Now scrollable */}
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center py-20">
          <div className="mb-12 space-y-8 max-w-4xl">
            <div className="flex items-center justify-center mb-8">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Welcome to{" "}
                <span className="italic font-extrabold text-slate-900">
                  {websiteName}
                </span>
              </h1>
            </div>
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
              Where friends gather to play, compete, and create memories
              together.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Play with Friends
                </h3>
                <p className="text-slate-600 text-sm">
                  Connect and compete with friends
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Endless Fun
                </h3>
                <p className="text-slate-600 text-sm">
                  Discover new challenges
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Gamepad2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Variety of Games
                </h3>
                <p className="text-slate-600 text-sm">
                  From trivia to strategy games
                </p>
              </div>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button
              onClick={handleGetStartedClick}
              size="lg"
              /* Accessible focus outline */
              className="px-10 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Get Started
            </Button>

            <Button
              onClick={handleGetStartedClick}
              variant="outline"
              size="lg"
              className="px-10 py-4 text-lg font-semibold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <Lightbulb className="mr-2 h-5 w-5" />
              Suggest a Game
            </Button>
          </div>
        </div>

        {/* Drag Handle at Bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-24 select-none bg-gradient-to-t from-white/80 to-transparent ${
            isAnimating
              ? "pointer-events-none"
              : "cursor-grab active:cursor-grabbing"
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="button"
          aria-label="Dismiss hero screen"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-1 bg-slate-400/60 rounded-full mb-3" />
            <ChevronUp
              className={`w-8 h-8 text-slate-500 transition-transform duration-200 ${
                isDragging ? "scale-110" : "animate-bounce"
              }`}
            />
            <p className="text-sm text-slate-500 mt-2">Drag up to dismiss</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-32 bg-slate-300/40 rounded-full overflow-hidden">
            <div
              className={`w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-full ${
                isDragging ? "" : "transition-all duration-300"
              }`}
              style={{
                height: `${position}%`,
                transform: "translateY(0)",
              }}
            />
          </div>
        </div>

        {/* Skip indicator */}
        {position > 50 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium animate-pulse shadow-lg">
              Release to continue
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
