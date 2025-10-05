import App from "@/layouts/App";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { route } from "ziggy-js";

interface Question {
  id: number;
  question: string;
  answers: string[];
  correct_answer: string;
  definition: string;
}

interface Props {
  auth: Auth;
  items: Question[];
  bestScore: number;
  gameSlug: string;
}

export default function Factually({
  auth,
  items,
  bestScore: initialBestScore,
  gameSlug,
}: Props) {
  const shuffleArray = (array: Question[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledItems, setShuffledItems] = useState(() => shuffleArray(items));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hoveredAnswer, setHoveredAnswer] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(initialBestScore);

  const currentQuestion = shuffledItems[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const newScore =
      answer === currentQuestion.correct_answer ? score + 1 : score;
    setScore(newScore);
  };

  const nextQuestion = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setGameOver(true);
      saveScore(score);
    }
  };

  const saveScore = async (finalScore: number) => {
    if (!auth.user) return;
    try {
      const response = await (window as any).axios.post(
        route("games.save-score"),
        {
          game: gameSlug,
          score: finalScore,
          user_id: auth.user.id,
        },
      );
      setBestScore(Math.max(bestScore, response.data.best_score));
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  const restart = () => {
    const newShuffled = shuffleArray(items);
    setShuffledItems(newShuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setHoveredAnswer(null);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <App auth={auth} title="Factually">
        <div className="max-w-2xl mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-3xl">
                Quiz Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <p className="text-5xl font-bold">{score}</p>
                <p className="text-muted-foreground">
                  out of {shuffledItems.length}
                </p>
              </div>
              <p className="text-lg">
                Best Score: <span className="font-bold">{bestScore}</span>
              </p>
              <Button onClick={restart} size="lg">
                Play Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </App>
    );
  }

  return (
    <App auth={auth} title="Factually">
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Factually</h1>
          <p className="text-muted-foreground">
            Question {currentIndex + 1} of {shuffledItems.length} | Score{" "}
            {score} | Best {bestScore}
          </p>
        </div>

        <div className="rounded-xl shadow-sm">
          <Card className="bg-transparent">
            <CardHeader className="px-6">
              <CardTitle className="text-lg">
                {currentQuestion.question.split("_")[0]}
                <span className="inline-flex items-center justify-center mx-2 px-3 py-0.5 border border-gray-200 rounded-md bg-white text-center min-w-[100px] shadow-sm font-normal">
                  {selectedAnswer || hoveredAnswer || "\u00A0"}
                </span>
                {currentQuestion.question.split("_")[1]}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-3">
              {currentQuestion.answers.map((answer, index) => {
                let variant: "default" | "destructive" | "outline" = "outline";
                let className = "w-full justify-start";

                if (selectedAnswer) {
                  if (answer === currentQuestion.correct_answer) {
                    variant = "default";
                  } else if (answer === selectedAnswer) {
                    variant = "outline";
                    className += " line-through text-muted-foreground";
                  } else {
                    variant = "outline";
                  }
                }

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(answer)}
                    onMouseEnter={() => setHoveredAnswer(answer)}
                    onMouseLeave={() => setHoveredAnswer(null)}
                    disabled={!!selectedAnswer}
                    variant={variant}
                    className={className}
                  >
                    {answer}
                  </Button>
                );
              })}

              {selectedAnswer && (
                <div className="pt-4 border-t space-y-4">
                  <p className="font-semibold text-center">
                    {isCorrect ? "Correct!" : "Incorrect!"}
                  </p>
                  <div className="text-sm text-muted-foreground text-center">
                    <p>{currentQuestion.definition}</p>
                  </div>
                  <div className="text-center">
                    <Button onClick={nextQuestion} size="sm">
                      Next Question
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </App>
  );
}
