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
        // Check for the exact headers we defined in FloorController@export
        if (empty($row['floor_or_section_name']) || empty($row['building_name'])) {
            return null;
        }

        // 🔥 Cascading Creation: Create the building if it doesn't exist!
        $building = Building::firstOrCreate(
            ['name' => trim($row['building_name'])]
        );

        // Update or create the Floor and attach it to the Building
        return Floor::updateOrCreate(
            [
                'name' => trim($row['floor_or_section_name']),
                'building_id' => $building->id
            ],
            [
                'description' => $row['description'] ?? null
            ]
        );
    }
}
