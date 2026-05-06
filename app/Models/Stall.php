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
        'size_sqm',
        'current_monthly_rental',
        'current_rate_per_sqm',
        'proposed_monthly_rental',
        'proposed_rate_per_sqm'
    ];

    protected $casts = [
        'size_sqm' => 'float',
        'current_monthly_rental' => 'float',
        'current_rate_per_sqm' => 'float',
        'proposed_monthly_rental' => 'float',
        'proposed_rate_per_sqm' => 'float',
    ];

    protected $appends = [
        'computed_status',
        'computed_monthly_rent'
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

    public function getComputedMonthlyRentAttribute()
    {
        return $this->current_monthly_rental;
    }

    public function getComputedStatusAttribute()
    {
        $contracts = $this->activeContracts;

        if ($contracts->isEmpty()) {
            $status = StallStatus::VACANT;
            return ['label' => $status->value, 'color' => $status->color()];
        }

        $contract = $contracts->first();

        if ($contract->permit_status === 'Closed') {
            $status = StallStatus::CLOSED;
            return ['label' => $status->value, 'color' => $status->color()];
        }

        if ($contract->document_status === 'For Contract') {
            $status = StallStatus::FOR_CONTRACT;
            return ['label' => $status->value, 'color' => $status->color()];
        }

        if ($contract->document_status === 'For Signing') {
            $status = StallStatus::FOR_SIGNING;
            return ['label' => $status->value, 'color' => $status->color()];
        }

        if ($contract->document_status === 'Signed') {
            $status = match ($contract->permit_status) {
                'Waiting' => StallStatus::WAITING_PERMIT,
                'On Process' => StallStatus::ON_PROCESS,
                'For Confirmation' => StallStatus::FOR_CONFIRMATION,
                'Unpaid' => StallStatus::UNPAID_PERMIT,
                'Valid' => StallStatus::SIGNED_CONTRACT,
                default => StallStatus::UNKNOWN,
            };

            return ['label' => $status->value, 'color' => $status->color()];
        }

        $status = StallStatus::UNKNOWN;
        return ['label' => $status->value, 'color' => $status->color()];
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }
}
