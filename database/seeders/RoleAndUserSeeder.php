<?php
//database\seeders\RoleAndUserSeeder.php
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
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage users',
            'manage facilities',
            'manage tenants',
            'manage contracts',
            'view contracts',
            'manage payments',
            'view reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions([
            'manage users',
            'manage facilities',
            'manage tenants',
            'manage contracts',
            'view contracts',
            'view reports',
            'manage payments',
        ]);

        $treasuryRole = Role::firstOrCreate(['name' => 'treasury']);
        $treasuryRole->syncPermissions([
            'view contracts',
            'manage payments',
            'view reports',
        ]);

        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $staffRole->syncPermissions([
            'view contracts',
            'view reports',
        ]);

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
