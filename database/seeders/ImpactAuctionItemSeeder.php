<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\GameItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ImpactAuctionItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $game = Game::firstOrCreate(
            ['slug' => 'impact-auction'],
            [
                'name' => 'Impact Auction',
                'description' => 'Bid on innovations and policies that shaped our world. Who will build the most impactful portfolio?',
                'thumbnail' => '/images/auction.jpg',
                'min_players' => 2,
                'max_players' => 6,
            ]
        );

        // Clear existing items for this game
        GameItem::where('game_id', $game->id)->delete();

        $items = [
            [
                'name' => 'Solar Energy Revolution',
                'description' => 'Mass adoption of solar panels and solar farms worldwide, transforming energy production.',
                'category' => 'renewable-energy',
                'positive_impact' => 95,
                'negative_impact' => 15,
                'net_impact' => 80,
                'impact_description' => 'Reduced carbon emissions by billions of tons, created millions of jobs, but caused manufacturing waste and land use concerns.',
            ],
            [
                'name' => 'Social Media Platforms',
                'description' => 'The rise of Facebook, Twitter, Instagram, and TikTok connecting billions globally.',
                'category' => 'social-media',
                'positive_impact' => 60,
                'negative_impact' => 70,
                'net_impact' => -10,
                'impact_description' => 'Connected people worldwide and enabled activism, but increased polarization, mental health issues, and misinformation.',
            ],
            [
                'name' => 'Universal Healthcare Systems',
                'description' => 'Government-funded healthcare providing medical care to all citizens regardless of income.',
                'category' => 'healthcare',
                'positive_impact' => 90,
                'negative_impact' => 25,
                'net_impact' => 65,
                'impact_description' => 'Saved millions of lives and reduced poverty, but strained government budgets and caused longer wait times.',
            ],
            [
                'name' => 'Commercial Space Travel',
                'description' => 'Private companies like SpaceX making space accessible for tourism and colonization.',
                'category' => 'space-travel',
                'positive_impact' => 45,
                'negative_impact' => 35,
                'net_impact' => 10,
                'impact_description' => 'Advanced technology and inspired innovation, but consumed massive resources with limited immediate benefits to most people.',
            ],
            [
                'name' => 'Free Online Education',
                'description' => 'Platforms like Khan Academy, Coursera, and YouTube providing free access to knowledge.',
                'category' => 'education',
                'positive_impact' => 85,
                'negative_impact' => 20,
                'net_impact' => 65,
                'impact_description' => 'Democratized education globally and upskilled millions, but reduced quality control and devalued traditional credentials.',
            ],
            [
                'name' => 'Electric Vehicles',
                'description' => 'Mass production of electric cars by Tesla, Nissan, and traditional manufacturers.',
                'category' => 'transportation',
                'positive_impact' => 70,
                'negative_impact' => 40,
                'net_impact' => 30,
                'impact_description' => 'Reduced urban air pollution and oil dependency, but created battery waste and mining environmental damage.',
            ],
            [
                'name' => 'CRISPR Gene Editing',
                'description' => 'Revolutionary gene-editing technology enabling treatment of genetic diseases.',
                'category' => 'healthcare',
                'positive_impact' => 80,
                'negative_impact' => 45,
                'net_impact' => 35,
                'impact_description' => 'Cured previously untreatable diseases and improved crop yields, but raised ethical concerns and potential misuse.',
            ],
            [
                'name' => 'Smartphone Revolution',
                'description' => 'The iPhone and Android devices putting powerful computers in everyone\'s pocket.',
                'category' => 'communication',
                'positive_impact' => 88,
                'negative_impact' => 50,
                'net_impact' => 38,
                'impact_description' => 'Enabled global connectivity and access to information, but caused addiction, privacy issues, and e-waste.',
            ],
            [
                'name' => 'Vertical Farming',
                'description' => 'Indoor agricultural systems growing food in urban areas with minimal land and water.',
                'category' => 'agriculture',
                'positive_impact' => 65,
                'negative_impact' => 30,
                'net_impact' => 35,
                'impact_description' => 'Reduced water usage and transportation emissions, but required high energy input and limited crop variety.',
            ],
            [
                'name' => 'Artificial Intelligence',
                'description' => 'Machine learning and AI systems transforming industries from healthcare to transportation.',
                'category' => 'technology',
                'positive_impact' => 75,
                'negative_impact' => 55,
                'net_impact' => 20,
                'impact_description' => 'Automated dangerous jobs and advanced medical diagnosis, but displaced workers and raised surveillance concerns.',
            ],
            [
                'name' => 'Wind Energy Farms',
                'description' => 'Massive wind turbine installations generating clean electricity across continents.',
                'category' => 'renewable-energy',
                'positive_impact' => 85,
                'negative_impact' => 25,
                'net_impact' => 60,
                'impact_description' => 'Provided clean renewable energy and rural jobs, but impacted bird populations and caused noise pollution.',
            ],
            [
                'name' => 'Remote Work Revolution',
                'description' => 'Mass adoption of working from home enabled by video conferencing and cloud tools.',
                'category' => 'communication',
                'positive_impact' => 70,
                'negative_impact' => 40,
                'net_impact' => 30,
                'impact_description' => 'Reduced commute time and carbon emissions, but increased isolation and blurred work-life boundaries.',
            ],
            [
                'name' => 'Cryptocurrency & Blockchain',
                'description' => 'Decentralized digital currencies like Bitcoin challenging traditional financial systems.',
                'category' => 'technology',
                'positive_impact' => 50,
                'negative_impact' => 60,
                'net_impact' => -10,
                'impact_description' => 'Enabled financial freedom and transparency, but consumed massive energy and facilitated illegal activities.',
            ],
            [
                'name' => 'Lab-Grown Meat',
                'description' => 'Cultured meat production eliminating the need to raise and slaughter animals.',
                'category' => 'agriculture',
                'positive_impact' => 78,
                'negative_impact' => 22,
                'net_impact' => 56,
                'impact_description' => 'Dramatically reduced animal suffering and methane emissions, but faced cultural resistance and high production costs.',
            ],
            [
                'name' => 'High-Speed Rail Networks',
                'description' => 'Bullet trains connecting cities at 300+ km/h, reducing domestic flight needs.',
                'category' => 'transportation',
                'positive_impact' => 75,
                'negative_impact' => 35,
                'net_impact' => 40,
                'impact_description' => 'Reduced carbon emissions and connected regions, but required massive infrastructure investment and land acquisition.',
            ],
        ];

        foreach ($items as $item) {
            GameItem::create([
                'game_id' => $game->id,
                'value' => $item,
            ]);
        }
    }
}
