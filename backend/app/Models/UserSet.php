<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\LegoSet;

class UserSet extends Model
{
    protected $fillable = [
        "user_id",
        "set_num",
        "status",
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function set()
    {
        return $this->belongsTo(LegoSet::class, 'set_num', 'set_num');

    }
}
