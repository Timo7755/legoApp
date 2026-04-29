<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RebrickableClient;
use App\Models\LegoSet;
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
    
}
