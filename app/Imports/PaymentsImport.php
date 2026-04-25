<?php
//app\Imports\PaymentsImport.php
namespace App\Imports;

use App\Models\Payment;
use App\Models\Contract;
use App\Models\Tenant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class PaymentsImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $index => $row) {
                $excelRow = $index + 2;

                if (empty($row['or_number']) && empty($row['tenant_last_name']) && empty($row['amount'])) {
                    continue; // Skip empty rows
                }

                if (empty($row['or_number']) || empty($row['amount'])) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: OR Number and Amount are strictly required."
                    ]);
                }

                $tenantQuery = Tenant::where('last_name', trim($row['tenant_last_name']));
                if (!empty($row['tenant_first_name'])) {
                    $tenantQuery->where('first_name', trim($row['tenant_first_name']));
                }
                $tenant = $tenantQuery->first();

                // Validation Guardrails
                if (!$tenant) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: Tenant '{$row['tenant_first_name']} {$row['tenant_last_name']}' not found. Cannot assign payment OR# {$row['or_number']}."
                    ]);
                }

                $contract = Contract::where('tenant_id', $tenant->id)
                    ->where('is_active', true)
                    ->latest()
                    ->first();

                if (!$contract) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: No active contract found for Tenant '{$row['tenant_first_name']} {$row['tenant_last_name']}'. Cannot map payment OR# {$row['or_number']}."
                    ]);
                }

                $paymentDate = isset($row['payment_date'])
                    ? Carbon::parse($row['payment_date'])->format('Y-m-d')
                    : Carbon::now()->format('Y-m-d');

                // Safe Upsert by OR Number
                Payment::updateOrCreate(
                    ['or_number' => trim($row['or_number'])],
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
        });
    }
}
