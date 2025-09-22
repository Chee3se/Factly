<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\GameItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizLadderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $qui = Game::create([
            'name' => 'Quiz Ladder',
            'slug' => 'quiz-ladder',
            'description' => 'Put your general knowledge to the test',
            'thumbnail' => '/images/ladder.jpg',
            'min_players' => 2,
            'max_players' => 6,
        ]);

        $items = [
            // Easy Questions (1-2 points)
            [
                'question' => 'What is the capital of France?',
                'options' => ['Paris', 'London', 'Berlin', 'Madrid'],
                'correct_answer' => 'Paris',
                'difficulty' => 'easy',
                'points' => 1,
            ],
            [
                'question' => 'How many legs does a spider have?',
                'options' => ['6', '8', '10', '12'],
                'correct_answer' => '8',
                'difficulty' => 'easy',
                'points' => 1,
            ],
            [
                'question' => 'What color do you get when you mix red and white?',
                'options' => ['Orange', 'Purple', 'Pink', 'Yellow'],
                'correct_answer' => 'Pink',
                'difficulty' => 'easy',
                'points' => 1,
            ],
            [
                'question' => 'Which planet is known as the Red Planet?',
                'options' => ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                'correct_answer' => 'Mars',
                'difficulty' => 'easy',
                'points' => 2,
            ],
            [
                'question' => 'What is the largest mammal in the world?',
                'options' => ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
                'correct_answer' => 'Blue Whale',
                'difficulty' => 'easy',
                'points' => 2,
            ],

            // Medium Questions (3-4 points)
            [
                'question' => 'Who painted the Mona Lisa?',
                'options' => ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
                'correct_answer' => 'Leonardo da Vinci',
                'difficulty' => 'medium',
                'points' => 3,
            ],
            [
                'question' => 'What is the chemical symbol for gold?',
                'options' => ['Go', 'Gd', 'Au', 'Ag'],
                'correct_answer' => 'Au',
                'difficulty' => 'medium',
                'points' => 3,
            ],
            [
                'question' => 'Which country gifted the Statue of Liberty to the United States?',
                'options' => ['United Kingdom', 'France', 'Spain', 'Italy'],
                'correct_answer' => 'France',
                'difficulty' => 'medium',
                'points' => 3,
            ],
            [
                'question' => 'What is the smallest country in the world?',
                'options' => ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'],
                'correct_answer' => 'Vatican City',
                'difficulty' => 'medium',
                'points' => 4,
            ],
            [
                'question' => 'In which year did the Berlin Wall fall?',
                'options' => ['1987', '1989', '1991', '1993'],
                'correct_answer' => '1989',
                'difficulty' => 'medium',
                'points' => 4,
            ],
            [
                'question' => 'What is the hardest natural substance on Earth?',
                'options' => ['Gold', 'Iron', 'Diamond', 'Platinum'],
                'correct_answer' => 'Diamond',
                'difficulty' => 'medium',
                'points' => 4,
            ],

            // Hard Questions (5-6 points)
            [
                'question' => 'Who wrote the novel "1984"?',
                'options' => ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'H.G. Wells'],
                'correct_answer' => 'George Orwell',
                'difficulty' => 'hard',
                'points' => 5,
            ],
            [
                'question' => 'What is the longest river in the world?',
                'options' => ['Amazon River', 'Nile River', 'Mississippi River', 'Yangtze River'],
                'correct_answer' => 'Nile River',
                'difficulty' => 'hard',
                'points' => 5,
            ],
            [
                'question' => 'Which element has the atomic number 1?',
                'options' => ['Helium', 'Hydrogen', 'Lithium', 'Carbon'],
                'correct_answer' => 'Hydrogen',
                'difficulty' => 'hard',
                'points' => 5,
            ],
            [
                'question' => 'In Greek mythology, who is the king of the gods?',
                'options' => ['Apollo', 'Poseidon', 'Hades', 'Zeus'],
                'correct_answer' => 'Zeus',
                'difficulty' => 'hard',
                'points' => 5,
            ],
            [
                'question' => 'What is the currency of Japan?',
                'options' => ['Won', 'Yuan', 'Yen', 'Ringgit'],
                'correct_answer' => 'Yen',
                'difficulty' => 'hard',
                'points' => 6,
            ],
            [
                'question' => 'Which composer wrote "The Four Seasons"?',
                'options' => ['Johann Sebastian Bach', 'Wolfgang Amadeus Mozart', 'Antonio Vivaldi', 'Ludwig van Beethoven'],
                'correct_answer' => 'Antonio Vivaldi',
                'difficulty' => 'hard',
                'points' => 6,
            ],

            // Very Hard Questions (7-10 points)
            [
                'question' => 'What is the capital of Bhutan?',
                'options' => ['Thimphu', 'Paro', 'Punakha', 'Jakar'],
                'correct_answer' => 'Thimphu',
                'difficulty' => 'hard',
                'points' => 7,
            ],
            [
                'question' => 'Which scientist developed the theory of continental drift?',
                'options' => ['Charles Darwin', 'Alfred Wegener', 'Gregor Mendel', 'Marie Curie'],
                'correct_answer' => 'Alfred Wegener',
                'difficulty' => 'hard',
                'points' => 8,
            ],
            [
                'question' => 'What is the rarest blood type?',
                'options' => ['AB-negative', 'O-negative', 'Rh-null', 'B-negative'],
                'correct_answer' => 'Rh-null',
                'difficulty' => 'hard',
                'points' => 9,
            ],
            [
                'question' => 'In which year was the first computer bug actually found?',
                'options' => ['1943', '1945', '1947', '1949'],
                'correct_answer' => '1947',
                'difficulty' => 'hard',
                'points' => 10,
            ],
        ];

        foreach ($items as $item) {
            GameItem::create([
                'game_id' => $qui->id,
                'value' => $item
            ]);
        }
    }
}
