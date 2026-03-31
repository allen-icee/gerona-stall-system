<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Status;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily so we can clear the old test data safely
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Status::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Exact legend pulled from the Municipal Excel File
        $statuses = [
            [
                'name' => 'VACANT',
                'color' => '#00ff00', // Green
                'description' => 'Stall is vacant and available.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - Signed contract',
                'color' => '#ffffff', // White
                'description' => 'Tenant has fully signed the contract.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - With contract (For signing)',
                'color' => '#00ffff', // Cyan
                'description' => 'Contract is printed and awaiting signature.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - For contract',
                'color' => '#ffff00', // Yellow
                'description' => 'Requirements met, waiting for contract drafting.'
            ],
            [
                'name' => 'COMPLETE REQUIREMENTS - Waiting for Business Permit',
                'color' => '#ff00ff', // Magenta
                'description' => 'Tenant is securing their municipal business permit.'
            ],
            [
                'name' => 'ON PROCESS',
                'color' => '#999999', // Gray
                'description' => 'Application is currently being processed.'
            ],
            [
                'name' => 'FOR CONFIRMATION',
                'color' => '#9900ff', // Purple
                'description' => 'Pending final confirmation from administration.'
            ],
            [
                'name' => 'CLOSED / CLOSED BUSINESS PERMIT',
                'color' => '#f4cccc', // Light Red
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