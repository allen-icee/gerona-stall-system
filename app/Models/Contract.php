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
        'permit_status'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // ... (Keep your existing stall() and tenant() relationships) ...

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // ==========================================
    // 🔥 THE FINANCIAL ENGINE (COMPUTED LOGIC)
    // ==========================================

    // 1. Total amount of money actually paid
    public function getTotalPaidAttribute()
    {
        return $this->payments()->sum('amount');
    }

    // 2. How many months the tenant has been occupying the stall
    public function getMonthsActiveAttribute()
    {
        $start = Carbon::parse($this->start_date);

        // If the contract hasn't started yet, 0 months active.
        if (Carbon::now()->lt($start)) {
            return 0;
        }

        // If active, calculate to TODAY. If expired/closed, calculate to the END DATE.
        $end = $this->is_active ? Carbon::now() : Carbon::parse($this->end_date);

        // +1 because the first month's rent is due immediately upon starting
        return $start->diffInMonths($end) + 1;
    }

    // 3. How much money they SHOULD have paid by now
    public function getExpectedRentAttribute()
    {
        return $this->months_active * $this->monthly_rent;
    }

    // 4. The actual Outstanding Balance (Overdue)
    public function getOutstandingBalanceAttribute()
    {
        $balance = $this->expected_rent - $this->total_paid;

        // Return 0 if they overpaid (advanced payment), otherwise return the debt
        return max(0, $balance);
    }

    // 5. Total Advanced Payment (If they paid ahead of time)
    public function getAdvancedPaymentAttribute()
    {
        $balance = $this->total_paid - $this->expected_rent;
        return max(0, $balance);
    }
}
