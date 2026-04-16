<?php
//app\Models\Floor.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Building;

class Floor extends Model
{

    protected $fillable = ['building_id', 'name', 'description'];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function stalls()
    {
        return $this->hasMany(Stall::class);
    }
    public function layouts()
    {
        return $this->hasMany(Layout::class);
    }
}
