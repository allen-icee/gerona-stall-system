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
        'monthly_rent',
        'security_deposit',
        'is_active',

        // --- Added Phase 1 Fields ---
        'permit_status',
        'document_status',
        'remarks',
        'deposit_paid',
        'deposit_reference'
    ];

    // Forces Laravel to send strictly "YYYY-MM-DD" to React
    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
        'deposit_paid' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'monthly_rent' => 'decimal:2',
    ];

    // 🔥 CRUCIAL: This automatically attaches our computed Excel math to the JSON sent to React!
    protected $appends = [
        'total_paid',
        'outstanding_balance',
        'deposit_variance',
        'total_outstanding',
        'monthly_matrix'
    ];

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

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
        return $this->hasMany(Payment::class);
    }

    // New Phase 1 Relationship
    public function violations()
    {
        return $this->hasMany(Violation::class);
    }

    // ==========================================
    // 🔥 THE FINANCIAL ENGINE (COMPUTED LOGIC)
    // ==========================================

    public function getTotalPaidAttribute()
    {
        return $this->payments()->sum('amount');
    }

    public function getMonthsActiveAttribute()
    {
        $start = Carbon::parse($this->start_date);

        if (Carbon::now()->lt($start))
            return 0;

        $end = $this->is_active ? Carbon::now() : Carbon::parse($this->end_date);
        return $start->diffInMonths($end) + 1;
    }

    public function getExpectedRentAttribute()
    {
        return $this->months_active * $this->monthly_rent;
    }

    public function getOutstandingBalanceAttribute()
    {
        return max(0, $this->expected_rent - $this->total_paid);
    }

    public function getAdvancedPaymentAttribute()
    {
        return max(0, $this->total_paid - $this->expected_rent);
    }

    // --- NEW TREASURY LOGIC ---

    public function getDepositVarianceAttribute()
    {
        // How much deposit they owe vs what they actually paid
        $required = $this->security_deposit ?? 0;
        $paid = $this->deposit_paid ?? 0;
        return $required - $paid;
    }

    public function getTotalOutstandingAttribute()
    {
        // Rental Debt + Missing Deposit
        return $this->outstanding_balance + max(0, $this->deposit_variance);
    }

    public function getMonthlyMatrixAttribute()
    {
        // 12-Month Treasury Grid
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

        // Ensure we don't crash if payments aren't loaded yet
        if ($this->relationLoaded('payments') || $this->payments()->exists()) {
            foreach ($this->payments as $payment) {
                // Assuming payment created_at represents the month paid. 
                // (If you have a specific 'payment_date' column, change 'created_at' to 'payment_date')
                $monthIndex = strtoupper($payment->created_at->format('M'));

                if (isset($matrix[$monthIndex])) {
                    $matrix[$monthIndex] += $payment->amount;
                }
            }
        }

        return $matrix;
    }
}