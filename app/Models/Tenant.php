<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'company_name',
        'contact_number',
        'address'
    ];

    // A tenant can have many contracts over time
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    // Helper to get the full name easily
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Get the history of stalls this tenant has occupied
    public function stallHistories()
    {
        return $this->hasMany(StallTenant::class);
    }


    // Get all payments made by this tenant
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
