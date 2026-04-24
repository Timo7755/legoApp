<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPart extends Model
{
    protected $fillable = [
        "user_id",
        "part_num",
        "color_id",
        "quantity_owned",
    ];
}
