<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Stall extends Model
{
    protected $fillable = [
        'building_id',
        'floor_id',
        'stall_code',
        'size_sqm',
        'rate_per_sqm',

        // --- NEW PHASE 6 FIELDS ---
        'section',
        'classification',
        'stall_type',
        'fixed_rate'
    ];

    // Ensure our pricing fields are always treated as numbers for math
    protected $casts = [
        'size_sqm' => 'float',
        'rate_per_sqm' => 'float',
        'fixed_rate' => 'float',
    ];

    // Tell Laravel to send these custom attributes to React!
    protected $appends = [
        'computed_status',
        'computed_monthly_rent' // Automatically send the calculated rent to the frontend
    ];

    // --- RELATIONSHIPS --- //

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

    public function activeContract()
    {
        return $this->hasOne(Contract::class)->where('contracts.is_active', true)->latestOfMany();
    }

    public function currentTenant()
    {
        return $this->hasOneThrough(Tenant::class, Contract::class, 'stall_id', 'id', 'id', 'tenant_id')
            ->where('contracts.is_active', true);
    }

    // --- THE AUTO-COMPUTE RENT ENGINE (PHASE 6) ---
    public function getComputedMonthlyRentAttribute()
    {
        switch ($this->stall_type) {
            case 'sqm_based':
                // Model A: Size x Municipal Rate
                return $this->size_sqm * $this->rate_per_sqm;

            case 'class_based':
                // Model B: Flat Rate by Classification (e.g., Class A = 1200)
                return $this->fixed_rate;

            case 'manual':
            default:
                // No computation, rely on manual input
                return 0;
        }
    }

    // --- THE DYNAMIC STATUS ENGINE (PHASE 3) ---
    public function getComputedStatusAttribute()
    {
        $contract = $this->activeContract;

        // 1. No Contract = VACANT
        if (!$contract) {
            return [
                'label' => 'VACANT',
                'color' => '#00ff00' // Green
            ];
        }

        // 2. Closed by LGU
        if ($contract->permit_status === 'Closed') {
            return [
                'label' => 'CLOSED',
                'color' => '#f4cccc' // Light Red/Pink
            ];
        }

        // 3. EEDO Paper Trail
        if ($contract->document_status === 'For Contract') {
            return [
                'label' => 'FOR CONTRACT',
                'color' => '#ffff00' // Yellow
            ];
        }

        if ($contract->document_status === 'For Signing') {
            return [
                'label' => 'FOR SIGNING',
                'color' => '#00ffff' // Cyan
            ];
        }

        // 4. Permit Processing (Only applies if contract is signed)
        if ($contract->document_status === 'Signed') {
            switch ($contract->permit_status) {
                case 'Waiting':
                    return [
                        'label' => 'WAITING FOR BUSINESS PERMIT',
                        'color' => '#ff00ff' // Magenta
                    ];
                case 'On Process':
                    return [
                        'label' => 'ON PROCESS',
                        'color' => '#999999' // Gray
                    ];
                case 'For Confirmation':
                    return [
                        'label' => 'FOR CONFIRMATION',
                        'color' => '#9900ff' // Purple
                    ];
                case 'Unpaid':
                    return [
                        'label' => 'UNPAID PERMIT',
                        'color' => '#ff0000' // Red
                    ];
                case 'Valid':
                    return [
                        'label' => 'SIGNED CONTRACT',
                        'color' => '#ffffff' // White
                    ];
            }
        }

        // Fallback
        return [
            'label' => 'UNKNOWN DATA',
            'color' => '#000000' // Black
        ];
    }
}