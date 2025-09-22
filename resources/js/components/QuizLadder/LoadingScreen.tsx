import React from 'react';
import App from "@/layouts/App";

interface LoadingScreenProps {
    auth: Auth;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ auth }) => {
    return (
        <App title="Quiz Ladder" auth={auth}>
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading game lobby...</p>
                </div>
            </div>
        </App>
    );
};
