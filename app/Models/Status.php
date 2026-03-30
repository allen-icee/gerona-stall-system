<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $fillable = ['name', 'color', 'description'];

    public function stalls()
    {
        return $this->hasMany(Stall::class);
    }
}