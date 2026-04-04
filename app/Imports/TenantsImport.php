<?php

namespace App\Imports;

use App\Models\Tenant;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TenantsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Skip empty rows
        if (empty($row['first_name']) || empty($row['last_name'])) {
            return null;
        }

        // Foolproof Sync: Check by full name. Update contact info if they exist, otherwise create.
        return Tenant::updateOrCreate(
            [
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name']
            ],
            [
                'company_name' => $row['company_name'] ?? null,
                'contact_number' => $row['contact_number'] ?? null,
                'address' => $row['address'] ?? null,
            ]
        );
    }
}
