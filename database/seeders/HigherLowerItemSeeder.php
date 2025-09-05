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
            'multiplayer' => false,
            'min_players' => 1,
            'max_players' => 1,
        ]);

        $items = [
            [
                'name' => 'US Household',
                'image_url' => 'https://www.shutterstock.com/image-photo/leesburg-virginia-usa-july-2-600nw-2326984263.jpg',
                'value' => 10632,
                'description' => 'An average U.S. household consumed about 10,791 kilowatt-hours (kWh) of electricity in 2022, which is approximately 899 kWh per month or 30 kWh per day.'
            ],
            [
                'name' => 'Iceland Person / Year',
                'image_url' => 'https://iceland24blog.com/wp-content/uploads/2018/06/icelandic-man-lopapeysa-sweater-waterfall.jpg',
                'value' => 50083,
                'description' => 'People in Iceland use a lot of electricity because they have energy-intensive industries, particularly aluminum smelting, that rely on cheap and abundant electricity from their abundant renewable hydroelectric and geothermal sources.'
            ],
            [
                'name' => 'Latvian Person / Year',
                'image_url' => 'https://static.lsm.lv/media/2025/05/large/1/qbs0.jpg',
                'value' => 3629,
                'description' => "Latvia's low energy consumption can be attributed to a combination of factors, including: energy-inefficient housing stock, which leads to high heating costs and therefore reduced overall consumption; high energy prices despite government support; and a historical context where the use of less expensive local resources, particularly wood, was common."
            ],
            [
                'name' => 'Light Bulb / Year',
                'image_url' => 'https://energyeducation.ca/wiki/images/9/94/Lightbulby.jpg',
                'value' => 876,
                'description' => "A traditional (incandescent) light bulb uses a lot of electricity because its filament is heated to a high temperature to produce light, with most of the energy wasted as heat rather than visible light."
            ],
            [
                'name' => 'LED Light / Year',
                'image_url' => 'https://ledakcijas.lv/cdn/shop/files/7794.1.jpg?v=1693897480',
                'value' => 13,
                'description' => "Modern LED light bulbs use so little power because they generate light through electroluminescence in a semiconductor, converting electricity directly into light with very little energy wasted as heat"
            ],
        ];

        foreach ($items as $item) {
            HigherLowerItem::create($item);
        }
    }
}
