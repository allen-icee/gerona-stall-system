<?php
//app\Imports\BuildingsImport.php
namespace App\Imports;

use App\Models\Building;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class BuildingsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['name'])) {
            return null;
        }

        return Building::updateOrCreate(
            ['name' => $row['name']],
            ['description' => $row['description'] ?? null]
        );
    }
}
