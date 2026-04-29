<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RebrickableClient;
use App\Models\LegoSet;
use App\Models\LegoInventory;
use App\Models\LegoPart;
use App\Models\LegoInvPart;
use App\Models\LegoColor;

class SetController extends Controller
{

    public function __construct(private RebrickableClient $rebrickable) {}

    public function search(Request $request)
    {
        $query = $request->query('q');
        if (!$query) {
            return response()->json([
                "message" => "Search query is required",
            ], 400);
        }

        $sets = $this->rebrickable->searchSets($query);
        

        return response()->json($sets);
    }


    public function show(string $setNum)
{
    $set = LegoSet::find($setNum);

    if (!$set) {
        $data = $this->rebrickable->getSet($setNum);

        $set = LegoSet::create([
            'set_num' => $data['set_num'],
            'name' => $data['name'],
            'year' => $data['year'],
            'theme_id' => $data['theme_id'],
            'num_parts' => $data['num_parts'],
            'img_url' => $data['set_img_url'],
        ]);
    }

    return response()->json($set);
}

public function parts(string $setNum)
{
    $set = LegoSet::find($setNum);

    if (!$set) {
        return response()->json(['message' => 'Set not found'], 404);
    }

    $inventory = LegoInventory::where('set_num', $setNum)
        ->orderBy('version', 'desc')
        ->first();

    if (!$inventory) {
        $data = $this->rebrickable->getSetParts($setNum);

        $inventory = LegoInventory::create([
            'set_num' => $setNum,
            'version' => 1,
        ]);

        foreach ($data['results'] as $item) {
            LegoPart::updateOrCreate(
                ['part_num' => $item['part']['part_num']],
                [
                    'name' => $item['part']['name'],
                    'part_cat_id' => $item['part']['part_cat_id'],
                    'img_url' => $item['part']['part_img_url'] ?? null,
                ]
            );
            LegoColor::updateOrCreate(
                ['id' => $item['color']['id']],
                [
                    'name' => $item['color']['name'],
                    'rgb' => $item['color']['rgb'] ?? null,
                ]
            );

            LegoInvPart::create([
                'inventory_id' => $inventory->id,
                'part_num' => $item['part']['part_num'],
                'color_id' => $item['color']['id'],
                'quantity' => $item['quantity'],
                'is_spare' => $item['is_spare'],
            ]);
           
        }
    }

    $parts = LegoInvPart::where('inventory_id', $inventory->id)
        ->with(['part', 'color'])
        ->get();

    return response()->json($parts);
}
    
}
