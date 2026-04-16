<?php
//app\Imports\PaymentsImport.php
namespace App\Imports;

use App\Models\Payment;
use App\Models\Contract;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class PaymentsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['or_number']) || empty($row['tenant_last_name']) || empty($row['amount'])) {
            return null;
        }

        $tenantQuery = Tenant::where('last_name', $row['tenant_last_name']);
        if (!empty($row['tenant_first_name'])) {
            $tenantQuery->where('first_name', $row['tenant_first_name']);
        }
        $tenant = $tenantQuery->first();

        if (!$tenant) {
            return null;
        }

        $contract = Contract::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->latest()
            ->first();

        if (!$contract) {
            return null;
        }

        $paymentDate = isset($row['payment_date'])
            ? Carbon::parse($row['payment_date'])->format('Y-m-d')
            : Carbon::now()->format('Y-m-d');

        return Payment::updateOrCreate(
            ['or_number' => $row['or_number']],
            [
                'contract_id' => $contract->id,
                'amount' => $row['amount'],
                'payment_date' => $paymentDate,
                'month' => strtoupper($row['month'] ?? Carbon::parse($paymentDate)->format('F')),
                'year' => $row['year'] ?? Carbon::parse($paymentDate)->format('Y'),
                'encoded_by' => Auth::id() ?? 1,
            ]
        );
    }
}
