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

    // Send the active stall count to React automatically
    protected $appends = ['active_stall_count'];

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function activeStalls()
    {
        return $this->belongsToMany(Stall::class, 'contracts')
            ->wherePivot('is_active', true)
            ->withPivot(['monthly_rent', 'start_date', 'end_date']);
    }

    // 🔥 Auto-calculate "No of stalls a person has"
    public function getActiveStallCountAttribute()
    {
        return $this->contracts()->where('is_active', true)->count();
    }
}