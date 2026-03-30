<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'company_name',
        'contact_number',
        'address'
    ];

    // Get the history of stalls this tenant has occupied
    public function stallHistories()
    {
        return $this->hasMany(StallTenant::class);
    }

    // Get all contracts under this tenant
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    // Get all payments made by this tenant
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}