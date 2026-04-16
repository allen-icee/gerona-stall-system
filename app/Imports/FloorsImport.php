<?php
//app\Imports\FloorsImport.php
namespace App\Imports;

use App\Models\Floor;
use App\Models\Building;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class FloorsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['floor_or_section_name']) || empty($row['building_name'])) {
            return null;
        }

        $building = Building::firstOrCreate(
            ['name' => trim($row['building_name'])]
        );

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
