<?php
//database\seeders\StatusSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Status;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
{
    public function run(): void
    {

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Status::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $statuses = [
            [
                'name' => 'VACANT',
                'color' => '#00ff00',
                'description' => 'Stall is vacant and available.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - Signed contract',
                'color' => '#ffffff',
                'description' => 'Tenant has fully signed the contract.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - With contract (For signing)',
                'color' => '#00ffff',
                'description' => 'Contract is printed and awaiting signature.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - For contract',
                'color' => '#ffff00',
                'description' => 'Requirements met, waiting for contract drafting.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - Waiting for Business Permit',
                'color' => '#ff00ff',
                'description' => 'Tenant is securing their municipal business permit.'
            ],
            [
                'name' => 'ON PROCESS',
                'color' => '#999999',
                'description' => 'Application is currently being processed.'
            ],
            [
                'name' => 'FOR CONFIRMATION',
                'color' => '#9900ff',
                'description' => 'Pending final confirmation from administration.'
            ],
            [
                'name' => 'CLOSED / CLOSED BUSINESS PERMIT',
                'color' => '#f4cccc',
                'description' => 'Stall is closed or business permit revoked.'
            ],
        ];

        foreach ($statuses as $status) {
            Status::create([
                'name' => $status['name'],
                'color' => $status['color'],
                'description' => $status['description']
            ]);
        }
    }
}
