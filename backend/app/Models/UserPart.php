<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\LegoPart;
use App\Models\LegoColor;

class UserPart extends Model
{
    protected $fillable = [
        "user_id",
        "part_num",
        "color_id",
        "quantity_owned",
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
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
