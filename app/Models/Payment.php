<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'contract_id',
        'amount',
        'payment_date',
        'month',
        'year',
        'or_number',
        'encoded_by'
    ];

    // THE FIX: Forces Laravel to send strictly "YYYY-MM-DD" to React
    protected $casts = [
        'payment_date' => 'date:Y-m-d',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function encoder()
    {
        return $this->belongsTo(User::class, 'encoded_by');
    }
}