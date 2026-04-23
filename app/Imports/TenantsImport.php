<?php
//app\Imports\TenantsImport.php
namespace App\Imports;

use App\Models\Tenant;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TenantsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['first_name']) || empty($row['last_name'])) {
            return null;
        }

        return Tenant::updateOrCreate(
            [
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name']
            ],
            [
                // Supports both new and old headers seamlessly
                'middle_name' => $row['middle_name'] ?? ($row['middle_initial'] ?? null),
                'suffix' => $row['suffix'] ?? null,
                'company_name' => $row['company_name'] ?? ($row['business_name'] ?? null),
                'contact_number' => $row['contact_number'] ?? null,
                'address' => $row['address'] ?? null,
            ]
        );
    }
}