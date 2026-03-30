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
        $adminRole = Role::create(['name' => 'admin']);
        $staffRole = Role::create(['name' => 'staff']);
        $treasuryRole = Role::create(['name' => 'treasury']);

        // 2. Create the Master Admin (You)
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@gerona.gov.ph',
            'password' => Hash::make('password123'), // Change this later!
        ]);
        $admin->assignRole($adminRole);

        // 3. Create a Test Staff
        $staff = User::create([
            'name' => 'Market Staff',
            'email' => 'staff@gerona.gov.ph',
            'password' => Hash::make('password123'),
        ]);
        $staff->assignRole($staffRole);

        // 4. Create a Test Treasury
        $treasury = User::create([
            'name' => 'Treasury Officer',
            'email' => 'treasury@gerona.gov.ph',
            'password' => Hash::make('password123'),
        ]);
        $treasury->assignRole($treasuryRole);
    }
}