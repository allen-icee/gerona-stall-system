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
        if (empty($row['name']) || empty($row['building'])) {
            return null;
        }

        $building = Building::where('name', $row['building'])->first();

        if (!$building) {
            return null;
        }

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
