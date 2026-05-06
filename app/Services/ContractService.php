<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ContractService
{
    /**
     * Handles the creation or renewal of a contract.
     */
    public function createContract(array $validatedData, bool $isRenewal = false, ?int $oldContractId = null, ?int $encodedBy = 1)
    {
        return DB::transaction(function () use ($validatedData, $isRenewal, $oldContractId, $encodedBy) {

            // Extract deposit info before creating the contract
            $depositPaid = $validatedData['deposit_paid'] ?? null;
            $depositRef = $validatedData['deposit_reference'] ?? null;
            unset($validatedData['deposit_paid'], $validatedData['deposit_reference']);

            // Handle Renewal Logic
            if ($isRenewal && $oldContractId) {
                $oldContract = Contract::find($oldContractId);

                if ($oldContract) {
                    $gracePeriodEnds = Carbon::parse($oldContract->end_date)->addHours(24);

                    // Apply penalty if renewed past grace period
                    if (now()->greaterThan($gracePeriodEnds)) {
                        $validatedData['monthly_rent'] = $validatedData['monthly_rent'] * 1.20; // 20% Penalty Note
                        $validatedData['remarks'] = ($validatedData['remarks'] ?? '') . ' [SYSTEM: 20% Late Renewal Penalty Applied]';
                    }

                    // Archive the old contract
                    $oldContract->update([
                        'is_active' => false,
                        'permit_status' => 'Closed',
                        'document_status' => 'Archived'
                    ]);
                }
            }

            // Create the new contract
            $contract = Contract::create($validatedData);

            // Handle initial deposit payment if provided
            if ($depositPaid > 0) {
                Payment::create([
                    'contract_id' => $contract->id,
                    'amount' => $depositPaid,
                    'payment_date' => now(),
                    'month' => now()->month, // Stored as integer
                    'year' => now()->year,
                    'payment_type' => 'deposit',
                    'or_number' => $depositRef ?? 'SYS-DEP-' . strtoupper(uniqid()),
                    'encoded_by' => $encodedBy,
                ]);
            }

            return $contract;
        });
    }

    /**
     * Handles the safe deletion of a contract and its payments.
     */
    public function deleteContract(Contract $contract)
    {
        DB::transaction(function () use ($contract) {
            Payment::where('contract_id', $contract->id)->delete();
            $contract->delete();
        });
    }
}
