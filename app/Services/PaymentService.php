<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Create a new payment record safely
     */
    public function createPayment(array $validatedData, int $userId)
    {
        return DB::transaction(function () use ($validatedData, $userId) {
            return Payment::create([
                'contract_id' => $validatedData['contract_id'],
                'amount' => $validatedData['amount'],
                'payment_type' => $validatedData['payment_type'],
                'payment_date' => $validatedData['payment_date'],
                'month' => $validatedData['month'] ?? null,
                'year' => $validatedData['year'] ?? null,
                'or_number' => $validatedData['or_number'],
                'encoded_by' => $userId,
            ]);
        });
    }

    /**
     * Update an existing payment record
     */
    public function updatePayment(Payment $payment, array $validatedData)
    {
        return DB::transaction(function () use ($payment, $validatedData) {
            $payment->update($validatedData);
            return $payment;
        });
    }

    /**
     * Safely delete a payment record
     */
    public function deletePayment(Payment $payment)
    {
        DB::transaction(function () use ($payment) {
            $payment->delete();
        });
    }
}
