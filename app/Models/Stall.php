<?php
//app\Models\Stall.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function activeContract()
    {
        return $this->hasOne(Contract::class)->where('contracts.is_active', true)->latestOfMany();
    }

    public function currentTenant()
    {
        return $this->hasOneThrough(Tenant::class, Contract::class, 'stall_id', 'id', 'id', 'tenant_id')
            ->where('contracts.is_active', true);
    }

    public function getComputedMonthlyRentAttribute()
    {

        return $this->current_monthly_rental;
    }

    public function getComputedStatusAttribute()
    {
        $contract = $this->activeContract;

        if (!$contract) {
            return [
                'label' => 'VACANT',
                'color' => '#00ff00'
            ];
        }

        if ($contract->permit_status === 'Closed') {
            return [
                'label' => 'CLOSED',
                'color' => '#f4cccc'
            ];
        }

        if ($contract->document_status === 'For Contract') {
            return [
                'label' => 'FOR CONTRACT',
                'color' => '#ffff00'
            ];
        }

        if ($contract->document_status === 'For Signing') {
            return [
                'label' => 'FOR SIGNING',
                'color' => '#00ffff'
            ];
        }

        if ($contract->document_status === 'Signed') {
            switch ($contract->permit_status) {
                case 'Waiting':
                    return ['label' => 'WAITING FOR BUSINESS PERMIT', 'color' => '#ff00ff'];
                case 'On Process':
                    return ['label' => 'ON PROCESS', 'color' => '#999999'];
                case 'For Confirmation':
                    return ['label' => 'FOR CONFIRMATION', 'color' => '#9900ff'];
                case 'Unpaid':
                    return ['label' => 'UNPAID PERMIT', 'color' => '#ff0000'];
                case 'Valid':
                    return ['label' => 'SIGNED CONTRACT', 'color' => '#ffffff'];
            }
        }

        return [
            'label' => 'UNKNOWN DATA',
            'color' => '#000000'
        ];
    }
}
