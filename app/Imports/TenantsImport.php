<?php
//app\Imports\TenantsImport.php
namespace App\Imports;

use App\Models\Tenant;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TenantsImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $index => $row) {
                $excelRow = $index + 2;

                if (empty($row['first_name']) && empty($row['last_name'])) {
                    continue; // Skip entirely empty rows
                }

                if (empty($row['first_name']) || empty($row['last_name'])) {
                    throw ValidationException::withMessages([
                        'import_error' => "Row {$excelRow}: Both First Name and Last Name are required."
                    ]);
                }

                Tenant::updateOrCreate(
                    [
                        'first_name' => trim($row['first_name']),
                        'last_name' => trim($row['last_name'])
                    ],
                    [
                        'middle_name' => $row['middle_name'] ?? ($row['middle_initial'] ?? null),
                        'suffix' => $row['suffix'] ?? null,
                        'company_name' => $row['company_name'] ?? ($row['business_name'] ?? null),
                        'contact_number' => $row['contact_number'] ?? null,
                        'address' => $row['address'] ?? null,
                    ]
                );
            }
        });
    }
}
