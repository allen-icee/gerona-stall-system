<?php
//app\Models\Layout.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Layout extends Model
{
    protected $fillable = ['floor_id', 'name', 'total_rows', 'total_cols'];

    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    public function cells()
    {
        return $this->hasMany(LayoutCell::class);
    }
}
