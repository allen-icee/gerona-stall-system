<?php

namespace App\Imports;

use App\Models\Stall;
use App\Models\Floor;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StallsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // NO STATUS checks here anymore!
        if (empty($row['stall_code']) || empty($row['floor'])) {
            return null;
        }

        $floor = Floor::where('name', $row['floor'])->first();

        if (!$floor) {
            return null;
        }

        return Stall::updateOrCreate(
            ['stall_code' => $row['stall_code']],
            [
                'building_id' => $floor->building_id,
                'floor_id' => $floor->id,
                'size_sqm' => $row['size_sqm'] ?? 0,
                'rate_per_sqm' => $row['rate_per_sqm'] ?? 0,
            ]
        );
    }
}
