<?php
//app\Imports\StallsImport.php
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
        if (empty($row['stall_code']) || empty($row['floor_or_section_name']) || empty($row['building_name'])) {
            return null;
        }

        // 1. Find or Create the Building, then update its description if provided
        $building = Building::firstOrCreate(
            ['name' => trim($row['building_name'])]
        );

        if (!empty($row['building_description'])) {
            $building->update(['description' => trim($row['building_description'])]);
        }

        // 2. Find or Create the Floor/Section, then update its description if provided
        $floor = Floor::firstOrCreate(
            [
                'name' => trim($row['floor_or_section_name']),
                'building_id' => $building->id
            ]
        );

        if (!empty($row['floor_or_section_description'])) {
            $floor->update(['description' => trim($row['floor_or_section_description'])]);
        }

        // 3. Find or Create the Stall (matching BOTH stall_code and building_id)
        return Stall::updateOrCreate(
            [
                'stall_code' => trim($row['stall_code']),
                'building_id' => $building->id // <-- CRITICAL: Respects the composite unique constraint
            ],
            [
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
