<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = ['first_name', 'last_name', 'company_name', 'contact_number', 'address'];

    // 1. A tenant's history of contracts
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    // 2. See all stalls this tenant is currently renting
    public function activeStalls()
    {
        return $this->belongsToMany(Stall::class, 'contracts')
            ->wherePivot('is_active', true)
            ->withPivot(['monthly_rent', 'start_date', 'end_date']);
    }
}
