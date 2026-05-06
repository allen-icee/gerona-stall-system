<?php

namespace App\Services;

use App\Models\Penalty;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;

class PenaltyService
{
    /**
     * Process an existing penalty (Approve or Waive)
     */
    public function processPenalty(Penalty $penalty, array $validatedData, int $userId)
    {
        return DB::transaction(function () use ($penalty, $validatedData, $userId) {
            $finalAmount = $validatedData['status'] === 'waived'
                ? 0
                : ($validatedData['adjusted_amount'] ?? $penalty->original_amount);

            $newNotes = $penalty->notes;
            if (!empty($validatedData['admin_notes'])) {
                $newNotes .= "\n[Admin Review]: " . $validatedData['admin_notes'];
            }

            $penalty->update([
                'status' => $validatedData['status'],
                'adjusted_amount' => $finalAmount,
                'notes' => $newNotes,
                'approved_by' => $userId,
                'approved_at' => now()
            ]);

            return $penalty;
        });
    }

    /**
     * Get the standardized penalty rate
     */
    public function getPenaltyRate(): float
    {
        return (float) SystemSetting::getVal('penalty_rate', 0.20);
    }
}
