<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegoInvPart extends Model
{
    protected $fillable = [
        "inventory_id",
        "part_num",
        "color_id",
        "quantity",
        "is_spare",
    ];
}
