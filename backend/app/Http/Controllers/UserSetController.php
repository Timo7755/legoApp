<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserSet;
class UserSetController extends Controller
{
    public function index(Request $request)
    {
        $sets = $request->user()->sets()->with('set')->get();


    return response()->json($sets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "set_num" => "required|string|max:255",
        ]);
        $userSet = UserSet::create([
            "user_id" => $request->user()->id,
            "set_num" => $validated["set_num"],
            "status" => "building",
        ]);
        $userSet->load('set');

        return response()->json($userSet, 201);
    }

    public function destroy(Request $request, UserSet $userSet)
    {
        if ($userSet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $userSet->delete();
        return response()->json(null, 204);
    
    }
}
