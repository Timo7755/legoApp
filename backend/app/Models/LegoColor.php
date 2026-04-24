<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegoColor extends Model
{
    public $incrementing = false;

    protected $fillable = [
        "id",
        "name",
        "rgb",
        "bricklink_id",
    ];
}
