<?php

namespace App\Console\Commands;

use App\Models\LegoTheme;
use App\Services\RebrickableClient;
use Illuminate\Console\Command;

class SeedLegoThemes extends Command
{
    protected $signature = 'lego:seed-themes';
    protected $description = 'Seed LEGO themes from Rebrickable API';

    public function handle(RebrickableClient $client): void
    {
        $this->info('Fetching themes from Rebrickable...');

        $data = $client->getThemes();
        $themes = $data['results'];

        $this->info('Found ' . count($themes) . ' themes. Seeding...');

        $bar = $this->output->createProgressBar(count($themes));

        foreach ($themes as $theme) {
            LegoTheme::updateOrCreate(
                ['id' => $theme['id']],
                [
                    'name' => $theme['name'],
                    'parent_id' => $theme['parent_id'],
                ]
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Themes seeded successfully.');
    }
}