<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegoInventory extends Model
{
    protected $fillable = [
        "set_num",
        "version",
    ];
}
