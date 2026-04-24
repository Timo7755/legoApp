<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\LegoInventory;

class LegoSet extends Model
{
    protected $keyType = "string";

    protected $primaryKey = "set_num";

    protected $fillable = [
        "set_num",
        "name",
        "year",
        "theme_id",
        "num_parts",
        "img_url",
    ];

    public function inventories()
    {
        return $this->hasMany(LegoInventory::class);
    }
}
