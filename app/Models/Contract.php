<?php

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
        'due_day', // Added from Phase 1!
        'monthly_rent',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
        'monthly_rent' => 'decimal:2',
        'due_day' => 'integer',
    ];

    protected $appends = [
        'rent_paid',
        'expected_rent',
        'outstanding_balance',
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

    // --- MATH & LEDGER CALCULATIONS ---

    public function getRentPaidAttribute()
    {
        if ($this->relationLoaded('payments')) {
            return $this->payments->where('payment_type', 'rent')->sum('amount');
        }
        return $this->payments()->where('payment_type', 'rent')->sum('amount');
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

    public function getOutstandingBalanceAttribute()
    {
        return max(0, $this->expected_rent - $this->rent_paid);
    }

    // --- PENALTY MATH ---

    public function getPenaltyIncurredAttribute()
    {
        if ($this->relationLoaded('penalties')) {
            return $this->penalties->where('status', 'approved')->sum('original_amount');
        }
        return $this->penalties()->where('status', 'approved')->sum('original_amount');
    }

    public function getPenaltyPaidAttribute()
    {
        if ($this->relationLoaded('payments')) {
            return $this->payments->where('payment_type', 'violation')->sum('amount');
        }
        return $this->payments()->where('payment_type', 'violation')->sum('amount');
    }

    public function getPenaltyBalanceAttribute()
    {
        return max(0, $this->penalty_incurred - $this->penalty_paid);
    }

    public function getTotalOutstandingAttribute()
    {
        return $this->outstanding_balance + $this->penalty_balance;
    }

    // --- MATRIX FOR REACT FRONTEND ---

    public function getMonthlyMatrixAttribute()
    {
        $matrix = ['JAN' => 0, 'FEB' => 0, 'MAR' => 0, 'APR' => 0, 'MAY' => 0, 'JUN' => 0, 'JUL' => 0, 'AUG' => 0, 'SEP' => 0, 'OCT' => 0, 'NOV' => 0, 'DEC' => 0];

        if ($this->relationLoaded('payments') || $this->payments()->exists()) {
            foreach ($this->payments as $payment) {
                if ($payment->payment_type === 'rent' && !empty($payment->month)) {
                    // Convert Integer Month (1-12) to Text (JAN-DEC)
                    $monthName = Carbon::createFromFormat('!m', $payment->month)->format('M');
                    $monthIndex = strtoupper($monthName);

                    if (isset($matrix[$monthIndex])) {
                        $matrix[$monthIndex] += $payment->amount;
                    }
                }
            }
        }
        return $matrix;
    }
}
