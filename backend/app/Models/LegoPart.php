<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegoPart extends Model
{
    protected $keyType = "string";

    protected $primaryKey = "part_num";

    protected $fillable = [
        "part_num",
        "name",
        "part_cat_id",
        "img_url",
    ];
}
