import React from "react";
import App from "@/layouts/App";

interface LoadingScreenProps {
  auth: Auth;
  children?: React.ReactNode;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  auth,
  children,
}) => {
  return (
    <App title="Quiz Ladder" auth={auth}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          {children || (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
              <p className="mt-4 text-muted-foreground text-sm">
                Loading game lobby…
              </p>
            </>
          )}
        </div>
      </div>
    </App>
  );
};
