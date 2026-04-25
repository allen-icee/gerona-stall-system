<?php
//app\Imports\StallsImport.php
namespace App\Imports;

use App\Models\Stall;
use App\Models\Floor;
use App\Models\Building;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StallsImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $index => $row) {
                $excelRow = $index + 2;

                if (
                    !isset($row['stall_code']) || (string) $row['stall_code'] === '' ||
                    !isset($row['floor_or_section_name']) || trim($row['floor_or_section_name']) === '' ||
                    !isset($row['building_name']) || trim($row['building_name']) === ''
                ) {
                    continue; // Skip empty rows silently
                }

                // Dynamic Master Data Creation
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

                // Strict Upsert for Stall
                Stall::updateOrCreate(
                    [
                        'stall_code' => trim($row['stall_code']),
                        'floor_id' => $floor->id
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
        });
    }
}
