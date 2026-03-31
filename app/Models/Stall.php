<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stall extends Model
{
    use HasFactory;

    // These must match your migration exactly
    protected $fillable = [
        'stall_code',
        'building_id',
        'floor_id',
        'status_id',
        'version'
    ];

    // ==========================================
    // Core Location & Status Relationships
    // ==========================================

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    public function status()
    {
        // Connects to the Color Legend
        return $this->belongsTo(Status::class);
    }

    // ==========================================
    // Layout & Mapping Relationships
    // ==========================================

    public function cell()
    {
        return $this->hasOne(LayoutCell::class);
    }

    // ==========================================
    // Tenant & Financial Relationships
    // ==========================================

    // The history of tenants who have rented this stall
    public function tenantHistories()
    {
        return $this->hasMany(StallTenant::class);
    }

    // A helper to quickly get the CURRENT active tenant
    public function currentTenant()
    {
        return $this->hasOne(StallTenant::class)->where('is_active', true);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}