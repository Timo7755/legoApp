<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RebrickableClient
{
    private string $apiKey;
    private string $baseUrl = 'https://rebrickable.com/api/v3/lego';

    public function __construct()
    {
        $this->apiKey = config('services.rebrickable.key');
    }

    private function get(string $endpoint, array $params = []): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'key ' . $this->apiKey,
        ])->get($this->baseUrl . $endpoint, $params);

        if ($response->failed()) {
            throw new \Exception('Rebrickable API error: ' . $response->status());
        }

        return $response->json();
    }

    public function searchSets(string $query, int $page = 1): array
    {
        return $this->get('/sets/', [
            'search' => $query,
            'page' => $page,
            'page_size' => 20,
        ]);
    }

    public function getSet(string $setNum): array
    {
        return $this->get("/sets/{$setNum}/");
    }

    public function getSetParts(string $setNum): array
    {
        return $this->get("/sets/{$setNum}/parts/", [
            'page_size' => 1000,
        ]);
    }

    public function getColors(): array
    {
        return $this->get('/colors/', ['page_size' => 200]);
    }

    public function getThemes(): array
    {
        return $this->get('/themes/', ['page_size' => 500]);
    }
}