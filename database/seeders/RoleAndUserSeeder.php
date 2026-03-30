<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $treasuryRole = Role::firstOrCreate(['name' => 'treasury']);

        // 2. Create the Master Admin
        $admin = User::create([
            'name' => 'System Admin',
            'username' => 'admin', // <-- NEW
            'email' => 'admin@gerona.gov.ph',
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole($adminRole);

        // 3. Create a Test Staff
        $staff = User::create([
            'name' => 'Market Staff',
            'username' => 'staff01', // <-- NEW
            'email' => 'staff@gerona.gov.ph',
            'password' => Hash::make('password123'),
        ]);
        $staff->assignRole($staffRole);

        // 4. Create a Test Treasury
        $treasury = User::create([
            'name' => 'Treasury Officer',
            'username' => 'treasury01', // <-- NEW
            'email' => 'treasury@gerona.gov.ph',
            'password' => Hash::make('password123'),
        ]);
        $treasury->assignRole($treasuryRole);
    }
}