<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'stall_id',
        'tenant_id',
        'amount',
        'payment_date',
        'month',
        'year',
        'or_number',
        'encoded_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
        'year' => 'integer',
    ];

    public function stall()
    {
        return $this->belongsTo(Stall::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    // Links to the specific Treasury staff member who logged the Official Receipt
    public function encoder()
    {
        return $this->belongsTo(User::class, 'encoded_by');
    }
}