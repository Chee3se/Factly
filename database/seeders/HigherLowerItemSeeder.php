<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\HigherLowerItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HigherLowerItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hol = Game::create([
            'name' => 'Higher or Lower',
            'slug' => 'higher-or-lower',
            'description' => 'Put your electricity consumption knowledge to the test!',
            'thumbnail' => '/images/higher-lower.png',
            'min_players' => 1,
            'max_players' => 1,
        ]);

        $items = [
            [
                'name' => 'Iceland person',
                'image_url' => 'https://iceland24blog.com/wp-content/uploads/2018/06/icelandic-man-lopapeysa-sweater-waterfall.jpg',
                'value' => 50083,
                'description' => 'Iceland has the world’s highest per capita electricity use, largely due to energy-intensive industries like aluminum smelting and widespread electric heating.'
            ],
            [
                'name' => 'Latvian person',
                'image_url' => 'https://static.lsm.lv/media/2025/05/large/1/qbs0.jpg',
                'value' => 3629,
                'description' => 'Latvia’s per capita electricity use is much lower than Northern Europe, reflecting a smaller industrial base and greater reliance on district heating and efficiency.'
            ],
            [
                'name' => 'Air Conditioner',
                'image_url' => 'https://www.128plumbing.com/wp-content/uploads/2023/10/ductless-head-scaled.jpg',
                'value' => 4500,
                'description' => 'It takes a lot of energy to literally change the climate inside your home. In some climates, the A/C can work 16 hours a day. The easiest recommendation is to invest in a programable thermostat. These devices make it easy to schedule your temperature changes throughout the day, allowing you to avoid cooling your home when no one is there. Additionally, during the summer months, keeping blinds closed and covering your windows with curtains can make a huge impact. Finally, ceiling fans can reduce the feeling of temperature in a room up to 4 degrees, allowing you to set the thermostat higher without feeling the heat.'
            ],
            [
                'name' => 'Lighting',
                'image_url' => 'https://cdn.bltdirect.com/images/festoon-30m-500x500.jpg',
                'value' => 1100,
                'description' => 'Creating light using incandescent bulbs is inefficient and creates a lot of heat. To reduce your lighting expense, replacing older incandescent bulbs with newer LED lights can save you close to $100/yr. LED bulbs are typically 5 times as efficient as incandescent bulbs, and last for much longer. The price of LED bulbs has dropped significantly in recent years, which means you can start saving money on your electricity bill sooner!'
            ],
            [
                'name' => 'Dishwasher',
                'image_url' => 'https://www.shutterstock.com/image-photo/dishwasher-modern-kitchen-perfectly-washing-600nw-2463623269.jpg',
                'value' => 200,
                'description' => 'Dishwashers consume electricity for both water heating and motorized washing cycles. Energy-efficient models and eco settings can significantly reduce consumption.'
            ],
            [
                'name' => 'Computer',
                'image_url' => 'https://cdn.britannica.com/77/170477-050-1C747EE3/Laptop-computer.jpg',
                'value' => 300,
                'description' => 'A desktop computer running several hours a day can use around 300 kWh per year. Laptops are much more efficient, often using less than one-third the energy.'
            ],
            [
                'name' => 'Refrigerator',
                'image_url' => 'https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1731617881-67233764.jpg?crop=1xw:1.00xh;center,top&resize=980:*',
                'value' => 1000,
                'description' => 'Refrigerators are among the largest continuous energy users in homes because they run 24/7. Newer Energy Star models can cut usage by up to 40%.'
            ],
            [
                'name' => 'World',
                'image_url' => 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?cs=srgb&dl=pexels-pixabay-87651.jpg&fm=jpg',
                'value' => 24000000000000,
                'description' => 'Total world electricity consumption per year, covering all sectors—residential, commercial, and industrial. Equivalent to ~3,700 kWh per person in 2023.'
            ],
            [
                'name' => 'China',
                'image_url' => 'https://images.tripadeal.com.au/cdn-cgi/image/format=auto,width=1200/https://cstad.s3.ap-southeast-2.amazonaws.com/5364_Incredible_China_WEB_HERO_1_GreatWall.jpg',
                'value' => 7000000000000,
                'description' => 'China is the largest electricity consumer globally, driven by rapid industrialization. Per capita use is around 6,600 kWh/year.'
            ],
            [
                'name' => 'United States',
                'image_url' => 'https://i.pinimg.com/736x/ab/49/b6/ab49b62a3ffadcaab3ce9f044d681d82.jpg',
                'value' => 4000000000000,
                'description' => 'The U.S. has one of the highest per capita electricity consumptions in the world (~13,000–15,000 kWh/year), due to large homes and high appliance usage.'
            ],
            [
                'name' => 'Russia',
                'image_url' => 'https://storage.united24media.com/thumbs/x/3/d1/c9b5496be23228d4f1071d8d6c071d13.jpg',
                'value' => 900000000000,
                'description' => 'Russia’s electricity use is influenced by heavy industry and cold climate. Per capita consumption is ~6,400 kWh/year.'
            ],
            [
                'name' => 'Norway',
                'image_url' => 'https://www.campervannorway.com/assets/img/blog/455.png',
                'value' => 128000000000,
                'description' => 'Norway has extremely high electricity use per person (~23,374 kWh/year), mostly due to widespread electric heating and abundant hydropower.'
            ],
            [
                'name' => 'Global Use / person',
                'image_url' => 'https://media.istockphoto.com/id/1919265357/photo/close-up-portrait-of-confident-businessman-standing-in-office.jpg?s=612x612&w=0&k=20&c=ZXRPTG9VMfYM3XDo1UL9DEpfO8iuGVSsyh8dptfKQsQ=',
                'value' => 3700,
                'description' => 'The world average annual electricity use per person in 2023, though actual values vary widely between countries.'
            ],
            [
                'name' => 'Finnish person',
                'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm2gneoa7TS44tRy-rFOxMiP_4ac7MOKSSHw&s',
                'value' => 14747,
                'description' => 'Finland’s per capita consumption is high, reflecting heating needs in cold winters and an advanced industrial economy.'
            ],
            [
                'name' => 'Albanian person',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Sofra_Dardane_-_Bajram_Curr.JPG',
                'value' => 2507,
                'description' => 'Albania’s per capita electricity use is low, reflecting a smaller economy and more limited industrial consumption.'
            ],
            [
                'name' => 'Kettle',
                'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScnvHWrLHhewJxr1BQloLhBJy9f0AySQzh1g&s',
                'value' => 150,
                'description' => 'Electric kettles are powerful but used for short durations. Frequent daily boiling adds up to ~150 kWh/year in households.'
            ],
            [
                'name' => 'Television',
                'image_url' => 'https://www.sencor.com/Sencor/media/content/Products/SLE32S700TCS-2.jpg',
                'value' => 200,
                'description' => 'A modern LED TV running ~5 hours a day consumes around 200 kWh/year. Older plasma models can use much more.'
            ],
            [
                'name' => 'Toaster',
                'image_url' => 'https://myborosil.com/cdn/shop/files/my-borosil-toasters-grills-borosil-krispy-pop-up-toaster-black-33330162106506.jpg',
                'value' => 30,
                'description' => 'Toasters are high power but used for very short times. A typical household uses ~30 kWh/year on toasting bread.'
            ],
            [
                'name' => 'Hairdryer',
                'image_url' => 'https://www.stefan.com.au/cdn/shop/files/Untitleddesign-2023-09-29T224951.978.png?v=1695991919',
                'value' => 60,
                'description' => 'Hairdryers are powerful (1–2 kW), but usage time is usually short. Typical households consume ~60 kWh/year.'
            ],
            [
                'name' => 'Fan',
                'image_url' => 'https://indoappliances.com/cdn/shop/files/10.png?v=1729503504',
                'value' => 120,
                'description' => 'Fans are energy efficient compared to air conditioners. Running a small fan for several hours daily uses ~120 kWh/year.'
            ]
        ];


        foreach ($items as $item) {
            HigherLowerItem::create($item);
        }
    }
}
