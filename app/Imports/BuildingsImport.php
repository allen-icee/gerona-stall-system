<?php

namespace App\Imports;

use App\Models\Building;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class BuildingsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['name'])) {
            return null; // Skip empty rows
        }

        // updateOrCreate is the magic foolproof function.
        // It looks for a matching 'name'. If found, it updates the description. If not, it creates a new row!
        return Building::updateOrCreate(
            ['name' => $row['name']],
            ['description' => $row['description'] ?? null]
        );
    }
}
