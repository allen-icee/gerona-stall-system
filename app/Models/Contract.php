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
        'is_active',

        // Document Statuses
        'permit_status',
        'document_status',
        'remarks',

        // --- NEW LGU EXCEL FIELDS ---
        'correct_deposit',
        'current_deposit',
        'deposit_name',
        'payables_with_penalty', // Historical arrears
        'business_permit_fee',
        'is_new_owner'
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
        'is_new_owner' => 'boolean',
        'monthly_rent' => 'decimal:2',
        'correct_deposit' => 'decimal:2',
        'current_deposit' => 'decimal:2',
        'payables_with_penalty' => 'decimal:2',
        'business_permit_fee' => 'decimal:2',
    ];

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
        // 🔥 FIXED: Explicitly define the foreign key to prevent the 1054 SQL error
        return $this->hasMany(Payment::class, 'contract_id', 'id');
    }

    // 🔥 Commented out until Phase 2 when the Violations Engine is built
    /*
    public function violations()
    {
        return $this->hasMany(Violation::class);
    }
    */

    // ==========================================
    // 🔥 THE FINANCIAL ENGINE (COMPUTED LOGIC)
    // ==========================================

    public function getTotalPaidAttribute()
    {
        // Check if relationship exists before querying to save DB calls if already loaded
        if ($this->relationLoaded('payments')) {
            return $this->payments->sum('amount');
        }
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

    // --- NEW TREASURY EXCEL LOGIC ---

    public function getDepositVarianceAttribute()
    {
        // Target correctly matches the Excel column logic
        $required = $this->correct_deposit ?? 0;
        $paid = $this->current_deposit ?? 0;
        return max(0, $required - $paid);
    }

    public function getTotalOutstandingAttribute()
    {
        // Standard Rent Debt + Missing Deposit + Historical Payables/Penalties
        return $this->outstanding_balance + $this->deposit_variance + ($this->payables_with_penalty ?? 0);
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

        // Ensure payments are loaded to prevent N+1 queries if iterating through many contracts
        if ($this->relationLoaded('payments') || $this->payments()->exists()) {
            foreach ($this->payments as $payment) {
                if (!empty($payment->month)) {
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
