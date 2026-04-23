<?php
//app\Models\Tenant.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'company_name',
        'contact_number',
        'address'
    ];

    protected $appends = ['active_stall_count'];

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function activeStalls()
    {
        return $this->belongsToMany(Stall::class, 'contracts')
            ->wherePivot('is_active', true)
            ->withPivot(['monthly_rent', 'start_date', 'end_date']);
    }

    public function getActiveStallCountAttribute()
    {
        return $this->contracts()->where('is_active', true)->count();
    }
}