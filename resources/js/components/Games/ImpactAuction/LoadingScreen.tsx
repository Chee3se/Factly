import React from "react";
import App from "@/layouts/App";
import { Gavel } from "lucide-react";

interface Props {
  auth: Auth;
  children?: React.ReactNode;
}

export function LoadingScreen({ auth, children }: Props) {
  return (
    <App title="Impact Auction" auth={auth}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-8 md:p-10">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Gavel className="w-7 h-7" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Impact Auction
            </h1>

            {children || (
              <>
                <p className="text-muted-foreground">
                  Preparing the auction. Get ready to bid.
                </p>

                <div className="flex justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>

                <div className="rounded-xl bg-muted/30 p-5 text-left">
                  <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                    How to play
                  </div>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary tabular-nums">
                        1.
                      </span>
                      <span>You get 1000 impact points to spend.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary tabular-nums">
                        2.
                      </span>
                      <span>Bid on policies, technologies, and movements.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary tabular-nums">
                        3.
                      </span>
                      <span>Highest bid wins each item.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary tabular-nums">
                        4.
                      </span>
                      <span>
                        Real-world impact is revealed at the end — highest total wins.
                      </span>
                    </li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}
