import React from "react";
import App from "@/layouts/App";

interface Props {
  auth: Auth;
  children?: React.ReactNode;
}

export function LoadingScreen({ auth, children }: Props) {
  return (
    <App title="Impact Auction - Loading" auth={auth}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="text-center space-y-6">
            {/* Auction Gavel Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white">Impact Auction</h1>

            {children || (
              <>
                <div className="space-y-2">
                  <p className="text-xl text-white/90">Preparing the auction...</p>
                  <p className="text-white/70">
                    Get ready to bid on innovations that shaped our world
                  </p>
                </div>

                {/* Loading Animation */}
                <div className="flex justify-center gap-2 py-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                </div>

                {/* Game Info */}
                <div className="bg-white/5 rounded-lg p-6 space-y-3 text-left">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    How to Play:
                  </h2>
                  <div className="space-y-2 text-white/80">
                    <p className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">1.</span>
                      <span>You'll receive 1000 impact points to spend</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">2.</span>
                      <span>Bid on policies, technologies, and movements</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">3.</span>
                      <span>Highest bidder wins each item</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">4.</span>
                      <span>
                        Real-world impact revealed at the end - highest total impact wins!
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}
