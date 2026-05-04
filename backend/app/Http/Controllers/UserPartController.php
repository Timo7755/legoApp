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

    public function forSet(Request $request, string $setNum)
{
    $ownedParts = UserPart::where('user_id', $request->user()->id)
        ->whereIn('part_num', function($query) use ($setNum) {
            $query->select('part_num')
                ->from('lego_inv_parts')
                ->join('lego_inventories', 'lego_inv_parts.inventory_id', '=', 'lego_inventories.id')
                ->where('lego_inventories.set_num', $setNum);
        })
        ->get()
        ->keyBy(fn($p) => $p->part_num . '_' . $p->color_id);

    return response()->json($ownedParts);
}

public function missingForSet(Request $request, string $setNum)
{
    $userId = $request->user()->id;

    $inventory = \App\Models\LegoInventory::where('set_num', $setNum)
        ->orderBy('version', 'desc')
        ->first();

    if (!$inventory) {
        return response()->json(['message' => 'Set inventory not found'], 404);
    }

    $invParts = \App\Models\LegoInvPart::where('inventory_id', $inventory->id)
        ->where('is_spare', false)
        ->with(['part', 'color'])
        ->get();

    $ownedMap = \App\Models\UserPart::where('user_id', $userId)
        ->whereIn('part_num', $invParts->pluck('part_num'))
        ->get()
        ->keyBy(fn($p) => $p->part_num . '_' . $p->color_id);

    $missing = $invParts->map(function($item) use ($ownedMap) {
        $key = $item->part_num . '_' . $item->color_id;
        $owned = $ownedMap[$key]->quantity_owned ?? 0;
        $still_needed = max(0, $item->quantity - $owned);

        return [
            'part_num' => $item->part_num,
            'name' => $item->part->name ?? 'Unknown',
            'color' => $item->color->name ?? 'Unknown',
            'color_rgb' => $item->color->rgb ?? null,
            'bricklink_color_id' => $item->color->bricklink_id ?? null,
            'img_url' => $item->part->img_url ?? null,
            'quantity_needed' => $item->quantity,
            'quantity_owned' => $owned,
            'still_needed' => $still_needed,
            'bricklink_url' => "https://www.bricklink.com/v2/catalog/catalogitem.page?P={$item->part_num}&idColor={$item->color->bricklink_id}",
        ];
    })
    ->filter(fn($item) => $item['still_needed'] > 0)
    ->values();

    return response()->json([
        'set_num' => $setNum,
        'missing_count' => $missing->count(),
        'results' => $missing,
    ]);
}
}
