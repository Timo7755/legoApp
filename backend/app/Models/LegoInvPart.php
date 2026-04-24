<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\LegoInventory;
use App\Models\LegoPart;
use App\Models\LegoColor;

class LegoInvPart extends Model
{
    protected $fillable = [
        "inventory_id",
        "part_num",
        "color_id",
        "quantity",
        "is_spare",
    ];

    public function inventory()
    {
        return $this->belongsTo(LegoInventory::class);
    }

    public function part()
    {
        return $this->belongsTo(LegoPart::class);
    }

    public function color()
    {
        return $this->belongsTo(LegoColor::class);
    }
}
