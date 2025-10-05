<?php
namespace Database\Seeders;
use App\Models\Game;
use App\Models\GameItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
class FactuallySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fac = Game::create([
            "name" => "Factually",
            "description" => "Find out interesting facts about the world we live in!",
            "slug" => "factually",
            "thumbnail" => "/images/factually.jpg",
            "min_players" => 1,
            "max_players" => 1,
        ]);
        // source: https://www.sciencefocus.com/science/fun-facts
        $items = [
            [
                "question" => "Octupi have _ heart/s",
                "answers" => ["one", "two", "three"],
                "correct_answer" => "three",
                "definition" => "They have eight limbs, but they're arms (for most species). Technically, when talking about cephalopods (octopuses, squids etc), scientists define tentacles as limbs with suckers at their end. Octopus arms have suckers down most of their length."
            ],
            [
                "question" => "Elephants are _ to jump",
                "answers" => ["able", "unable"],
                "correct_answer" => "unable",
                "definition" => "Elephants cannot jump because their massive weight and heavy bones are not suited for it, lacking the flexible ankles, strong leg muscles, and springy tendons of jumping animals."
            ],
            [
                "question" => "A cloud weighs around _ tonnes",
                "answers" => ["a thousand", "a million", "ten million"],
                "correct_answer" => "a million",
                "definition" => "Typically has a volume of around 1km3 and a density of around 1.003kg per m3 – that's a density that's around 0.4 per cent lower than the air surrounding it."
            ],
            [
                "question" => "Identical twins have _ fingerprints",
                "answers" => ["the same", "different"],
                "correct_answer" => "different",
                "definition" => "You can't blame your crimes on your twin, after all. This is because environmental factors during development in the womb (umbilical cord length, position in the womb, and the rate of finger growth) affect your fingerprint."
            ],
            [
                "question" => "Mars is not actually _",
                "answers" => ["round", "red", "cold"],
                "correct_answer" => "round",
                "definition" => "Unlike any other rocky planet in the Solar System, Mars is actually shaped like a rugby ball, but with different sizes along all three axes."
            ],
            [
                "question" => "A chicken once lived for _ months without a head",
                "answers" => ["1", "18", "36"],
                "correct_answer" => "18",
                "definition" => "Mike the chicken's incredible feat was recorded back in the 1940s in the USA. He survived as his jugular vein and most of his brainstem were left mostly intact, ensuring just enough brain function remained for survival. In the majority of cases, a headless chicken dies in a matter of minutes."
            ],
            [
                "question" => "The world's oldest dog lived to _ years old",
                "answers" => ["19.5", "24.5", "29.5"],
                "correct_answer" => "29.5",
                "definition" => "While the median age a dog reaches tends to be about 10-15 years, one Australian cattle dog, 'Bluey', survived to the ripe old age of 29.5."
            ],
            [
                "question" => "The world's oldest cat lived to _ years and three days",
                "answers" => ["28", "33", "38"],
                "correct_answer" => "38",
                "definition" => "Creme Puff was the oldest cat to ever live."
            ],
            [
                "question" => "Octopuses don't actually have _",
                "answers" => ["arms", "tentacles", "hearts"],
                "correct_answer" => "tentacles",
                "definition" => "They have eight limbs, but they're arms (for most species). Technically, when talking about cephalopods (octopuses, squids etc), scientists define tentacles as limbs with suckers at their end. Octopus arms have suckers down most of their length."
            ],
            [
                "question" => "When you cut a worm in two, it _",
                "answers" => ["regenerates", "dies"],
                "correct_answer" => "regenerates",
                "definition" => "That said, this only works if it's cut widthways – and not all will. Earthworms can regrow their tails, and the planarian flatworm can regrow its whole body from a tiny sliver of tissue."
            ],
            [
                "question" => "Wind turbines kill between _ birds each year in the UK",
                "answers" => ["1,000–5,000", "10,000–100,000", "500,000–1,000,000"],
                "correct_answer" => "10,000–100,000",
                "definition" => "Interestingly, painting one of the blades of a wind turbine black can reduce bird deaths by 70 per cent."
            ],
            [
                "question" => "A horse normally has around _ horsepower",
                "answers" => ["1", "10", "24"],
                "correct_answer" => "24",
                "definition" => "A study in 1993 showed that the maximum power a horse can produce is 18,000W, around 24 horsepower."
            ],
            [
                "question" => "Platypuses _ milk",
                "answers" => ["sweat", "produce", "don't produce"],
                "correct_answer" => "sweat",
                "definition" => "This is because it doesn't have teats. Milk appears as sweat on a platypus, but it's an aquatic mammal so it doesn't actually sweat at all."
            ],
            [
                "question" => "The longest anyone has held their breath underwater is over _ minutes",
                "answers" => ["10.5", "17.5", "24.5"],
                "correct_answer" => "24.5",
                "definition" => "The world record for breath-holding underwater was achieved by Croatian Budimir Šobat on 27 March 2021, who held his breath for a total of 24 minutes and 37 seconds. On average, a human can hold their breath between 30-90 seconds."
            ],
            [
                "question" => "The Moon is _",
                "answers" => ["shrinking", "expanding", "stable"],
                "correct_answer" => "shrinking",
                "definition" => "But only very slightly – by about 50m (164ft) in radius over the last several hundred million years. Mysterious seismic activity, known as moonquakes, could be to blame."
            ],
            [
                "question" => "Earth is _ billion years old",
                "answers" => ["2.54", "4.54", "6.54"],
                "correct_answer" => "4.54",
                "definition" => "Using radiometric dating, scientists have discovered that the Earth is 4.54 billion years old (give or take 50 million years). This makes our planet half the age of the Milky Way Galaxy (11-13 billion years old) and around a third of the age of the Universe (10-15 billion years old)."
            ],
            [
                "question" => "Your brain burns _ calories a day",
                "answers" => ["100-200", "400-500", "800-900"],
                "correct_answer" => "400-500",
                "definition" => "That's about a fifth of your total energy requirements. Most of this is concerned with the largely automatic process of controlling your muscles and processing sensory input, although some studies show solving tricky problems increases your brain's metabolic requirements too."
            ],
            [
                "question" => "You can't fold a piece of A4 paper more than _ times",
                "answers" => ["five", "eight", "twelve"],
                "correct_answer" => "eight",
                "definition" => "As the number of layers doubles each time, the paper rapidly gets too thick and too small to fold. The current world paper-folding record belongs to California high school student Britney Gallivan, who in 2002 managed to fold a 1.2km-long piece of tissue paper 12 times."
            ],
            [
                "question" => "You can see stars as they were _ years ago with the naked eye",
                "answers" => ["400", "4,000", "40,000"],
                "correct_answer" => "4,000",
                "definition" => "Without a telescope, all the stars we can see lie within about 4,000 light-years of us. That means at most you're seeing stars as they were 4,000 years ago, around when the pyramids were being built in Egypt."
            ],
            [
                "question" => "You inhale _ potentially harmful bacteria every time you breathe",
                "answers" => ["5", "50", "500"],
                "correct_answer" => "50",
                "definition" => "Thankfully, your immune system is working hard all the time, so virtually all of these are promptly destroyed without you feeling a thing. Phew."
            ],
        ];
        foreach ($items as $item) {
            GameItem::create([
                "game_id" => $fac->id,
                "value" => $item
            ]);
        }
    }
}
