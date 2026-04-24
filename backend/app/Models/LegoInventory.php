<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\LegoSet;
use App\Models\LegoInvPart;

class LegoInventory extends Model
{
    protected $fillable = [
        "set_num",
        "version",
    ];

    public function set()
    {
        return $this->belongsTo(LegoSet::class);
    }

    public function parts()
    {
        return $this->hasMany(LegoInvPart::class);
    }
}
