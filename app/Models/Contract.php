<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    protected $fillable = [
        'stall_id',
        'tenant_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'security_deposit'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'monthly_rent' => 'decimal:2',
        'security_deposit' => 'decimal:2',
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