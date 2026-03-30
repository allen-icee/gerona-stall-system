<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stall extends Model
{
    protected $fillable = [
        'stall_code',
        'building_id',
        'floor_id',
        'status_id',
        'version'
    ];

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
        return $this->belongsTo(Status::class); // Connects to the Color Legend
    }

    public function cell()
    {
        return $this->hasOne(LayoutCell::class);
    }
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