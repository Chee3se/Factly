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
      <div className="min-h-[80vh] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-center">
          {children || (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-6 text-gray-700 text-lg font-medium">
                Loading game lobby...
              </p>
            </>
          )}
        </div>
      </div>
    </App>
  );
};
