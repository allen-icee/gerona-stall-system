<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LayoutCell extends Model
{
    protected $fillable = [
        'layout_id',
        'row_number',
        'column_number',
        'type',
        'stall_id'
    ];

    public function layout()
    {
        return $this->belongsTo(Layout::class);
    }

    public function stall()
    {
        return $this->belongsTo(Stall::class);
    }
}