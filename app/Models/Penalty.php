<?php
//app\Models\Penalty.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penalty extends Model
{
    protected $fillable = [
        'contract_id',
        'month_covered',
        'original_amount',
        'adjusted_amount',
        'status',
        'is_auto_generated',
        'notes',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'original_amount' => 'decimal:2',
        'adjusted_amount' => 'decimal:2',
        'is_auto_generated' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
