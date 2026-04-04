<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Stall extends Model
{
    protected $fillable = ['building_id', 'floor_id', 'stall_code', 'size_sqm', 'rate_per_sqm'];

    // Tell Laravel to send this custom attribute to React!
    protected $appends = ['computed_status'];

    // --- NEW MISSING RELATIONSHIPS --- //

    // A stall belongs to a specific floor
    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    // A stall belongs to a specific building
    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    // --------------------------------- //

    // 1. A stall has a history of many contracts
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    // 2. A stall has ONE currently active contract
    public function activeContract()
    {
        return $this->hasOne(Contract::class)->where('contracts.is_active', true)->latestOfMany();
    }

    // 3. Get the current tenant directly through the active contract
    public function currentTenant()
    {
        return $this->hasOneThrough(Tenant::class, Contract::class, 'stall_id', 'id', 'id', 'tenant_id')
            ->where('contracts.is_active', true);
    }

    // 4. THE GENIUS PART: Dynamic Computed Status
    public function getComputedStatusAttribute()
    {
        $contract = $this->activeContract;

        if (!$contract) {
            return 'VACANT';
        }
        if ($contract->permit_status === 'PENDING') {
            return 'WAITING FOR PERMIT';
        }
        if (Carbon::now()->greaterThan(Carbon::parse($contract->end_date))) {
            return 'FOR RENEWAL';
        }

        return 'OCCUPIED';
    }
}
