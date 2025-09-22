export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
}

export interface PlayerSelection {
    userId: number;
    answerIndex: number;
    userName: string;
}

export interface PlayerGameState {
    userId: number;
    cubes: number;
    position: number;
    hasAnswered: boolean;
    selectedAnswer: number | null;
    isReady: boolean;
}

export interface GameState {
    currentQuestion: number;
    timeLeft: number;
    phase: 'waiting' | 'question' | 'results' | 'finished';
    playerStates: { [userId: number]: PlayerGameState };
    selectedAnswer: number | null;
    hasAnswered: boolean;
    questionStartTime: number;
    questions: Question[];
    currentQuestionData: Question | null;
    playerSelections: PlayerSelection[];
    isGameOwner: boolean;
}
