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

                $paymentType = strtolower(trim((string) ($row['payment_type'] ?? 'rent')));
                if (!in_array($paymentType, ['rent', 'deposit', 'violation'], true)) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: Payment type '{$row['payment_type']}' is not valid."
                    ]);
                }

                $month = $this->normalizeMonth($row['month'] ?? Carbon::parse($paymentDate)->month);
                if ($month === null) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: Month '{$row['month']}' is not valid."
                    ]);
                }

                // Safe Upsert by OR Number
                Payment::updateOrCreate(
                    ['or_number' => trim($row['or_number'])],
                    [
                        'contract_id' => $contract->id,
                        'amount' => $row['amount'],
                        'payment_type' => $paymentType,
                        'payment_date' => $paymentDate,
                        'month' => $month,
                        'year' => $row['year'] ?? Carbon::parse($paymentDate)->format('Y'),
                        'encoded_by' => Auth::id() ?? 1,
                    ]
                );
            }
        });
    }

    private function normalizeMonth($month): ?int
    {
        if (is_numeric($month)) {
            $month = (int) $month;
            return $month >= 1 && $month <= 12 ? $month : null;
        }

        $months = [
            'JAN' => 1,
            'JANUARY' => 1,
            'FEB' => 2,
            'FEBRUARY' => 2,
            'MAR' => 3,
            'MARCH' => 3,
            'APR' => 4,
            'APRIL' => 4,
            'MAY' => 5,
            'JUN' => 6,
            'JUNE' => 6,
            'JUL' => 7,
            'JULY' => 7,
            'AUG' => 8,
            'AUGUST' => 8,
            'SEP' => 9,
            'SEPTEMBER' => 9,
            'OCT' => 10,
            'OCTOBER' => 10,
            'NOV' => 11,
            'NOVEMBER' => 11,
            'DEC' => 12,
            'DECEMBER' => 12,
        ];

        return $months[strtoupper(trim((string) $month))] ?? null;
    }
}
