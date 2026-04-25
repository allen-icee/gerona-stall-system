<?php
//app\Imports\ContractsImport.php
namespace App\Imports;

use App\Models\Contract;
use App\Models\Stall;
use App\Models\Tenant;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class ContractsImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        // Wrap the entire import in a transaction. If one row fails, nothing saves.
        DB::transaction(function () use ($rows) {
            foreach ($rows as $index => $row) {
                // Adjust index for Excel rows (Header is row 1, data starts at 2)
                $excelRow = $index + 2;

                if (empty($row['tenant_first_name']) || empty($row['tenant_last_name']) || empty($row['stall_code'])) {
                    continue; // Skip completely empty rows
                }

                $tenant = Tenant::where('first_name', $row['tenant_first_name'])
                    ->where('last_name', $row['tenant_last_name'])
                    ->first();

                $stall = Stall::where('stall_code', $row['stall_code'])->first();

                // 1. Dependency Validation
                if (!$tenant) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: Tenant '{$row['tenant_first_name']} {$row['tenant_last_name']}' not found. Import Tenants first."
                    ]);
                }

                if (!$stall) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: Stall code '{$row['stall_code']}' not found in database."
                    ]);
                }

                // 2. Business Logic Validation (Prevent double-booking)
                $activeContract = Contract::where('stall_id', $stall->id)
                    ->where('is_active', true)
                    ->first();

                if ($activeContract && $activeContract->tenant_id !== $tenant->id) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: Stall '{$row['stall_code']}' is already occupied by another active tenant."
                    ]);
                }

                // 3. Safe Upsert
                $startDate = isset($row['start_date']) ? Carbon::parse($row['start_date'])->format('Y-m-d') : null;
                $endDate = isset($row['end_date']) ? Carbon::parse($row['end_date'])->format('Y-m-d') : null;

                Contract::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'stall_id' => $stall->id,
                    ],
                    [
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'monthly_rent' => $row['monthly_rent'] ?? 0,
                        'security_deposit' => $row['security_deposit'] ?? 0,
                        'is_active' => true,
                        'permit_status' => 'PENDING'
                    ]
                );
            }
        });
    }
}
