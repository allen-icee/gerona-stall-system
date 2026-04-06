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

    // THE FIX: Forces Laravel to send strictly "YYYY-MM-DD" to React
    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
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
}