<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class RoleAndUserSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define Strict Enterprise Permissions
        $permissions = [
            'manage users',
            'manage facilities', // Buildings, Floors, Stalls
            'manage tenants',
            'manage contracts',  // EEDO Only
            'view contracts',    // Shared
            'manage payments',   // Treasury Only
            'view reports',      // Shared
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 2. Create Roles & Assign Isolated Permissions

        // EEDO / Admin Role (Cannot manage payments)
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions([
            'manage users',
            'manage facilities',
            'manage tenants',
            'manage contracts',
            'view contracts',
            'view reports',
        ]);

        // Treasury Role (Cannot manage facilities, tenants, or draft contracts)
        $treasuryRole = Role::firstOrCreate(['name' => 'treasury']);
        $treasuryRole->syncPermissions([
            'view contracts', // Needed to see who owes money
            'manage payments',
            'view reports',
        ]);

        // Staff Role (Basic read-only)
        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $staffRole->syncPermissions([
            'view contracts',
            'view reports',
        ]);

        // 3. Create the Default Accounts using firstOrCreate to avoid duplicates
        $admin = User::firstOrCreate(
            ['email' => 'admin@gerona.gov.ph'],
            [
                'name' => 'EEDO Admin',
                'username' => 'admin',
                'password' => Hash::make('Admin_123'),
            ]
        );
        $admin->assignRole($adminRole);

        $treasury = User::firstOrCreate(
            ['email' => 'treasury@gerona.gov.ph'],
            [
                'name' => 'Treasury Officer',
                'username' => 'treasury01',
                'password' => Hash::make('Treasury_123'),
            ]
        );
        $treasury->assignRole($treasuryRole);

        $staff = User::firstOrCreate(
            ['email' => 'staff@gerona.gov.ph'],
            [
                'name' => 'Market Staff',
                'username' => 'staff01',
                'password' => Hash::make('Staff_123'),
            ]
        );
        $staff->assignRole($staffRole);
    }
}