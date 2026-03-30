<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StallTenant extends Model
{
    protected $fillable = [
        'stall_id',
        'tenant_id',
        'start_date',
        'end_date',
        'is_active'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function stall()
    {
        return $this->belongsTo(Stall::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}