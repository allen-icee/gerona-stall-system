<?php

namespace App\Imports;

use App\Models\Stall;
use App\Models\Floor;
use App\Models\Building;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StallsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Check for the exact headers we defined in StallController@export
        if (empty($row['stall_code']) || empty($row['floor_or_section_name']) || empty($row['building_name'])) {
            return null;
        }

        // 🔥 Cascading Hierarchy Creation
        // 1. Ensure the Building exists
        $building = Building::firstOrCreate(
            ['name' => trim($row['building_name'])]
        );

        // 2. Ensure the Floor exists inside that Building
        $floor = Floor::firstOrCreate(
            [
                'name' => trim($row['floor_or_section_name']),
                'building_id' => $building->id
            ]
        );

        // 3. Create or update the Stall with the matched/created IDs and all pricing fields
        return Stall::updateOrCreate(
            ['stall_code' => trim($row['stall_code'])],
            [
                'building_id' => $building->id,
                'floor_id' => $floor->id,
                'size_sqm' => isset($row['size_sqm']) ? (float)$row['size_sqm'] : 0,
                'current_monthly_rental' => isset($row['current_monthly_rental']) ? (float)$row['current_monthly_rental'] : 0,
                'current_rate_per_sqm' => isset($row['current_rate_per_sqm']) ? (float)$row['current_rate_per_sqm'] : 0,
                'proposed_monthly_rental' => isset($row['proposed_monthly_rental']) ? (float)$row['proposed_monthly_rental'] : 0,
                'proposed_rate_per_sqm' => isset($row['proposed_rate_per_sqm']) ? (float)$row['proposed_rate_per_sqm'] : 0,
            ]
        );
    }
}
