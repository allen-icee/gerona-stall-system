<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Stall extends Model
{
    // UPDATE THIS LINE: Add building_id, remove status_id
    protected $fillable = ['building_id', 'floor_id', 'stall_code', 'size_sqm', 'rate_per_sqm'];
    // 1. A stall has a history of many contracts
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    // 2. A stall has ONE currently active contract
    // A stall has ONE currently active contract
    public function activeContract()
    {
        // Added 'contracts.' before 'is_active' to prevent any SQL ambiguity!
        return $this->hasOne(Contract::class)->where('contracts.is_active', true)->latestOfMany();
    }

    // 3. Get the current tenant directly through the active contract
    public function currentTenant()
    {
        return $this->hasOneThrough(Tenant::class, Contract::class, 'stall_id', 'id', 'id', 'tenant_id')
            ->where('contracts.is_active', true);
    }

    // 🔥 4. THE GENIUS PART: Dynamic Computed Status
    // You can now call $stall->computed_status anywhere in your app!
    public function getComputedStatusAttribute()
    {
        $contract = $this->activeContract;

        // If no active contract exists
        if (!$contract) {
            return 'VACANT';
        }

        // If contract exists but business permit is pending
        if ($contract->permit_status === 'PENDING') {
            return 'WAITING FOR PERMIT';
        }

        // If contract is past its end date
        if (Carbon::now()->greaterThan(Carbon::parse($contract->end_date))) {
            return 'FOR RENEWAL';
        }

        // If we want to check financials (You will build this in Phase C)
        // if ($contract->hasOverdueBalance()) { return 'DELINQUENT'; }

        return 'OCCUPIED';
    }
}
