<?php

namespace App\Imports;

use App\Models\Stall;
use App\Models\Floor;
use App\Models\Status;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StallsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Skip empty rows or rows missing vital relational data
        if (empty($row['stall_code']) || empty($row['floor']) || empty($row['status'])) {
            return null;
        }

        // Resolve the relational IDs by their names
        $floor = Floor::where('name', $row['floor'])->first();
        $status = Status::where('name', $row['status'])->first();

        // If the referenced floor or status doesn't exist in the DB, skip to prevent crashes
        if (!$floor || !$status) {
            return null;
        }

        // Foolproof Sync: If a stall with this code exists, update its location/status. Otherwise, create it.
        return Stall::updateOrCreate(
            ['stall_code' => $row['stall_code']],
            [
                'floor_id' => $floor->id,
                'status_id' => $status->id
            ]
        );
    }
}
