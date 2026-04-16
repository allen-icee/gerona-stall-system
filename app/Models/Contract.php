<?php
//app\Models\Contract.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Contract extends Model
{
    protected $fillable = [
        'stall_id',
        'tenant_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'deposit_required',
        'is_active',
        'permit_status',
        'document_status',
        'remarks',
        'payables_with_penalty',
        'business_permit_fee',
        'is_new_owner'
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
        'is_new_owner' => 'boolean',
        'monthly_rent' => 'decimal:2',
        'deposit_required' => 'decimal:2',
        'payables_with_penalty' => 'decimal:2',
        'business_permit_fee' => 'decimal:2',
    ];

    protected $appends = [
        'total_paid',
        'outstanding_balance',
        'deposit_variance',
        'penalty_balance',
        'total_outstanding',
        'monthly_matrix'
    ];


    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function stall()
    {
        return $this->belongsTo(Stall::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'contract_id', 'id');
    }

    public function penalties()
    {
        return $this->hasMany(Penalty::class, 'contract_id', 'id');
    }

    public function getRentPaidAttribute()
    {
        if ($this->relationLoaded('payments')) return $this->payments->where('payment_type', 'rent')->sum('amount');
        return $this->payments()->where('payment_type', 'rent')->sum('amount');
    }

    public function getDepositPaidAttribute()
    {
        if ($this->relationLoaded('payments')) return $this->payments->where('payment_type', 'deposit')->sum('amount');
        return $this->payments()->where('payment_type', 'deposit')->sum('amount');
    }

    public function getPenaltyPaidAttribute()
    {
        if ($this->relationLoaded('payments')) return $this->payments->where('payment_type', 'violation')->sum('amount');
        return $this->payments()->where('payment_type', 'violation')->sum('amount');
    }

    public function getTotalPaidAttribute()
    {
        return $this->rent_paid + $this->deposit_paid + $this->penalty_paid;
    }

    public function getMonthsActiveAttribute()
    {
        $start = Carbon::parse($this->start_date);
        if (Carbon::now()->lt($start)) return 0;

        $end = $this->is_active ? Carbon::now() : Carbon::parse($this->end_date);
        return $start->diffInMonths($end) + 1;
    }

    public function getExpectedRentAttribute()
    {
        return $this->months_active * $this->monthly_rent;
    }

    public function getPenaltyIncurredAttribute()
    {

        if ($this->relationLoaded('penalties')) return $this->penalties->where('status', 'approved')->sum('adjusted_amount');
        return $this->penalties()->where('status', 'approved')->sum('adjusted_amount');
    }

    public function getOutstandingBalanceAttribute()
    {
        return max(0, $this->expected_rent - $this->rent_paid);
    }

    public function getDepositVarianceAttribute()
    {
        return max(0, ($this->deposit_required ?? 0) - $this->deposit_paid);
    }

    public function getPenaltyBalanceAttribute()
    {
        return max(0, $this->penalty_incurred - $this->penalty_paid);
    }

    public function getTotalOutstandingAttribute()
    {

        return $this->outstanding_balance + $this->deposit_variance + $this->penalty_balance + ($this->payables_with_penalty ?? 0);
    }

    public function getMonthlyMatrixAttribute()
    {
        $matrix = [
            'JAN' => 0,
            'FEB' => 0,
            'MAR' => 0,
            'APR' => 0,
            'MAY' => 0,
            'JUN' => 0,
            'JUL' => 0,
            'AUG' => 0,
            'SEP' => 0,
            'OCT' => 0,
            'NOV' => 0,
            'DEC' => 0
        ];

        if ($this->relationLoaded('payments') || $this->payments()->exists()) {
            foreach ($this->payments as $payment) {
                if ($payment->payment_type === 'rent' && !empty($payment->month)) {
                    $monthIndex = substr(strtoupper($payment->month), 0, 3);
                    if (isset($matrix[$monthIndex])) {
                        $matrix[$monthIndex] += $payment->amount;
                    }
                }
            }
        }
        return $matrix;
    }
}
