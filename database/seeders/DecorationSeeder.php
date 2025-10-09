<?php

namespace Database\Seeders;

use App\Models\Decoration;
use Illuminate\Database\Seeder;

class DecorationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Decoration::create([
            'name' => 'Astronaut helmet',
            'description' => 'One small step for man, a giant leap for mankind.',
            'image_url' => 'https://picsum.photos/seed/astro/100/100',
        ]);

        Decoration::create([
            'name' => 'Television',
            'description' => 'Display your knowledge by becoming the box of knowledge.',
            'image_url' => 'https://picsum.photos/seed/television/100/100',
        ]);
    }
}
