<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RebrickableClient;

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
}
