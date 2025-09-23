<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ImpactAuctionItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hol = Game::create([
            'name' => 'Impact Auction',
            'slug' => 'impact-auction',
            'description' => 'Vote on the items you think made the most Impact in the world!',
            'thumbnail' => '/images/auction.jpg',
            'min_players' => 2,
            'max_players' => 6,
        ]);


    }
}
