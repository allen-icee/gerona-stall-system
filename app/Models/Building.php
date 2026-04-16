<?php
//app\Models\Building.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
