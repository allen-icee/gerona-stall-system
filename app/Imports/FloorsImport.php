<?php

namespace App\Imports;

use App\Models\Floor;
use App\Models\Building;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class FloorsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Skip empty rows or rows without the required references
        if (empty($row['name']) || empty($row['building'])) {
            return null;
        }

        // Resolve the parent building by name to get its ID
        $building = Building::where('name', $row['building'])->first();

        if (!$building) {
            return null; // Skip this floor if the parent building doesn't exist
        }

        // Foolproof Sync: If a floor with the same name exists IN THAT BUILDING, update it. Otherwise, create it.
        return Floor::updateOrCreate(
            [
                'name' => $row['name'],
                'building_id' => $building->id
            ],
            [
                'description' => $row['description'] ?? null
            ]
        );
    }
}
