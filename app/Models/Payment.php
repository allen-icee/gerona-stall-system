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

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function encoder()
    {
        return $this->belongsTo(User::class, 'encoded_by');
    }
}
