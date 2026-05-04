<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserPart;
class UserPartController extends Controller
{
    
    public function upsert(Request $request)
    {
        $validated = $request->validate([
            "part_num" => "required|string|max:255",
            "color_id" => "required|integer|max:255",
            "quantity_owned" => "required|integer|min:0",
        ]);

        $userPart = UserPart::updateOrCreate([
            "user_id" => $request->user()->id,
            "part_num" => $validated["part_num"],
            "color_id" => $validated["color_id"],
        ], [
            "quantity_owned" => $validated["quantity_owned"],
        ]);

        return response()->json($userPart, 200);
    }
}
