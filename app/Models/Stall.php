<?php

namespace App\Models;

use App\Enums\StallStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stall extends Model
{
    protected $fillable = [
        'building_id',
        'floor_id',
        'stall_code',
        'section',
        'classification',
        'stall_type',
        'size_sqm',
        'current_monthly_rental',
        'current_rate_per_sqm',
        'proposed_monthly_rental',
        'proposed_rate_per_sqm',
        'fixed_rate'
    ];

    protected $casts = [
        'size_sqm' => 'float',
        'current_monthly_rental' => 'float',
        'current_rate_per_sqm' => 'float',
        'proposed_monthly_rental' => 'float',
        'proposed_rate_per_sqm' => 'float',
        'fixed_rate' => 'float',
    ];

    protected $appends = [
        'computed_status',
        'computed_monthly_rent',
        'active_contract'
    ];

    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function activeContracts(): HasMany
    {
        return $this->hasMany(Contract::class)->where('is_active', true);
    }

    // Helper to easily grab the occupant for the frontend Maps & Tables
    public function getActiveContractAttribute()
    {
        return $this->activeContracts->first();
    }

    public function getComputedMonthlyRentAttribute()
    {
        return $this->current_monthly_rental;
    }

    // THE MAGIC HAPPENS HERE: Simple Vacant vs Occupied check
    public function getComputedStatusAttribute()
    {
        $contracts = $this->activeContracts;

        if ($contracts->isEmpty()) {
            $status = StallStatus::VACANT;
            return ['label' => $status->value, 'color' => $status->color()];
        }

        $status = StallStatus::OCCUPIED;
        return ['label' => $status->value, 'color' => $status->color()];
    }
}
