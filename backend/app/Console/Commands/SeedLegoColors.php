<?php

namespace App\Console\Commands;

use App\Services\RebrickableClient;
use Illuminate\Console\Command;
use App\Models\LegoColor;

class SeedLegoColors extends Command
{
    protected $signature = 'lego:seed-colors';
    protected $description = 'Seed LEGO colors from Rebrickable API';

    public function handle(RebrickableClient $client): void
    {
        $this->info('Fetching themes from Rebrickable...');

        $data = $client->getColors();
        $colors = $data['results'];

        $this->info('Found ' . count($colors) . ' colors. Seeding...');

        $bar = $this->output->createProgressBar(count($colors));

        foreach ($colors as $color) {
            LegoColor::updateOrCreate(
                ['id' => $color['id']],
                [
                    'name' => $color['name'],
                    "rgb" => $color['rgb'],
                    "bricklink_id" => $color['external_ids']['BrickLink']['ext_ids'][0] ?? null

                ]
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Colors seeded successfully.');
    }
}