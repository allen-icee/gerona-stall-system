<?php
//app\Imports\ContractsImport.php
namespace App\Imports;

use App\Models\Contract;
use App\Models\Stall;
use App\Models\Tenant;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class ContractsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['tenant_first_name']) || empty($row['tenant_last_name']) || empty($row['stall_code'])) {
            return null;
        }

        $tenant = Tenant::where('first_name', $row['tenant_first_name'])
            ->where('last_name', $row['tenant_last_name'])
            ->first();

        $stall = Stall::where('stall_code', $row['stall_code'])->first();

        if (!$tenant || !$stall) {
            return null;
        }

        $startDate = isset($row['start_date']) ? Carbon::parse($row['start_date'])->format('Y-m-d') : null;
        $endDate = isset($row['end_date']) ? Carbon::parse($row['end_date'])->format('Y-m-d') : null;

        return Contract::updateOrCreate(
            [
                'tenant_id' => $tenant->id,
                'stall_id' => $stall->id,
            ],
            [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'monthly_rent' => $row['monthly_rent'] ?? 0,
                'security_deposit' => $row['security_deposit'] ?? 0,

                'is_active' => true,
                'permit_status' => 'PENDING'
            ]
        );
    }
}
