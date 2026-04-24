<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegoTheme extends Model
{
    public $incrementing = false;

    protected $fillable = [
        "id",
        "name",
        "parent_id",
    ];
}
