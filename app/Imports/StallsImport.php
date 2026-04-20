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
        if (
            !isset($row['stall_code']) || (string) $row['stall_code'] === '' ||
            !isset($row['floor_or_section_name']) || trim($row['floor_or_section_name']) === '' ||
            !isset($row['building_name']) || trim($row['building_name']) === ''
        ) {
            return null;
        }

        $building = Building::firstOrCreate(
            ['name' => trim($row['building_name'])]
        );

        if (!empty($row['building_description'])) {
            $building->update(['description' => trim($row['building_description'])]);
        }

        $floor = Floor::firstOrCreate(
            [
                'name' => trim($row['floor_or_section_name']),
                'building_id' => $building->id
            ]
        );

        if (!empty($row['floor_or_section_description'])) {
            $floor->update(['description' => trim($row['floor_or_section_description'])]);
        }

        return Stall::updateOrCreate(
            [
                'stall_code' => trim($row['stall_code']),
                'floor_id' => $floor->id // Matches the new floor_id scope!
            ],
            [
                'building_id' => $building->id,
                'size_sqm' => isset($row['size_sqm']) && $row['size_sqm'] !== '' ? (float) $row['size_sqm'] : 0,
                'current_monthly_rental' => isset($row['current_monthly_rental']) && $row['current_monthly_rental'] !== '' ? (float) $row['current_monthly_rental'] : 0,
                'current_rate_per_sqm' => isset($row['current_rate_per_sqm']) && $row['current_rate_per_sqm'] !== '' ? (float) $row['current_rate_per_sqm'] : 0,
                'proposed_monthly_rental' => isset($row['proposed_monthly_rental']) && $row['proposed_monthly_rental'] !== '' ? (float) $row['proposed_monthly_rental'] : 0,
                'proposed_rate_per_sqm' => isset($row['proposed_rate_per_sqm']) && $row['proposed_rate_per_sqm'] !== '' ? (float) $row['proposed_rate_per_sqm'] : 0,
            ]
        );
    }
}