<?php

use Illuminate\Database\Eloquent\Model;
use App\Models\Floor;
use App\Models\Stall;
class Building extends Model
{
    protected $fillable = ['name', 'description'];

    public function floors()
    {
        return $this->hasMany(Floor::class);
    }

    public function stalls()
    {
        return $this->hasMany(Stall::class);
    }
}