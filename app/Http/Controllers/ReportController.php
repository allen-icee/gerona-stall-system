<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Generates the "With Balance" Report.
     * Shows any active tenant who owes Rent or is missing Security Deposit.
     */
    public function balances(Request $request)
    {
        // 1. Fetch active contracts, strictly eager-loading payments to prevent DB crashes
        $contracts = Contract::with(['tenant', 'stall.floor.building', 'payments'])
            ->where('is_active', true)
            ->get();

        // 2. Filter using our Phase 2 Engine: Only keep if total debt > 0
        $withBalance = $contracts->filter(function ($contract) {
            return $contract->total_outstanding > 0;
        })->map(function ($contract) {
            return [
                'id' => $contract->id,
                'tenant_name' => $contract->tenant->last_name . ', ' . $contract->tenant->first_name,
                'stall_code' => $contract->stall->stall_code ?? 'N/A',
                'location' => ($contract->stall->floor->name ?? '') . ' - ' . ($contract->stall->floor->building->name ?? ''),
                'monthly_rent' => $contract->monthly_rent,
                'deposit_variance' => $contract->deposit_variance,
                'outstanding_rent' => $contract->outstanding_balance,
                'total_outstanding' => $contract->total_outstanding,
                // Check if they've ever made a payment
                'last_payment_date' => $contract->payments->last() ? $contract->payments->last()->created_at->format('M d, Y') : 'No Payments on Record',
            ];
        })->values(); // Reset array keys for React

        return Inertia::render('Reports/Balances', [
            'balances' => $withBalance
        ]);
    }

    /**
     * Generates the "For Closure" / Action Required Report.
     * Shows tenants whose permit is Closed, or debt exceeds ₱10,000.
     */
    public function closures(Request $request)
    {
        $contracts = Contract::with(['tenant', 'stall.floor.building', 'payments'])
            ->where('is_active', true)
            ->get();

        $closures = $contracts->filter(function ($contract) {
            // Flag if LGU closed their permit OR if their debt is severely high
            return $contract->permit_status === 'Closed' || $contract->total_outstanding >= 10000;
        })->map(function ($contract) {

            // Determine the primary reason for closure flag
            if ($contract->permit_status === 'Closed') {
                $reason = 'Permit Revoked / Closed by LGU';
                $severity = 'critical';
            } else {
                $reason = 'Severe Delinquency (Owes ₱' . number_format($contract->total_outstanding, 2) . ')';
                $severity = 'high';
            }

            return [
                'id' => $contract->id,
                'tenant_name' => $contract->tenant->last_name . ', ' . $contract->tenant->first_name,
                'stall_code' => $contract->stall->stall_code ?? 'N/A',
                'permit_status' => $contract->permit_status,
                'total_outstanding' => $contract->total_outstanding,
                'reason' => $reason,
                'severity' => $severity
            ];
        })->values();

        return Inertia::render('Reports/Closures', [
            'closures' => $closures
        ]);
    }

    /**
     * Instantly exports the "With Balance" report to a CSV file.
     */
    public function exportBalances()
    {
        $contracts = Contract::with(['tenant', 'stall', 'payments'])
            ->where('is_active', true)
            ->get()
            ->filter(fn($c) => $c->total_outstanding > 0);

        // Standardized Excel Headers
        $csvData = "Tenant Name,Stall Code,Missing Deposit,Outstanding Rent,Total Debt\n";

        foreach ($contracts as $contract) {
            $name = '"' . str_replace('"', '""', $contract->tenant->last_name . ', ' . $contract->tenant->first_name) . '"';
            $stall = '"' . str_replace('"', '""', $contract->stall->stall_code ?? 'N/A') . '"';
            $depVar = $contract->deposit_variance > 0 ? $contract->deposit_variance : 0;

            $csvData .= "{$name},{$stall},{$depVar},{$contract->outstanding_balance},{$contract->total_outstanding}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="LGU_With_Balances_Report.csv"');
    }
}