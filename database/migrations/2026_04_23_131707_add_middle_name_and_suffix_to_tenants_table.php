<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // 1. Add the new columns
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('suffix')->nullable()->after('last_name');
        });

        // 2. Safely separate existing data so you don't lose current initials/suffixes
        $tenants = DB::table('tenants')->get();
        foreach ($tenants as $tenant) {
            $fName = $tenant->first_name;
            $mi = null;
            // Extract existing M.I.
            if (preg_match('/ ([a-zA-Z])\.$/i', $fName, $matches)) {
                $mi = strtoupper($matches[1] . '.');
                $fName = trim(preg_replace('/ [a-zA-Z]\.$/i', '', $fName));
            }

            $lName = $tenant->last_name;
            $suf = null;
            $suffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
            // Extract existing suffix
            foreach ($suffixes as $s) {
                if (str_ends_with($lName, ' ' . $s)) {
                    $suf = $s;
                    $lName = trim(substr($lName, 0, -strlen(' ' . $s)));
                    break;
                }
            }

            DB::table('tenants')->where('id', $tenant->id)->update([
                'first_name' => $fName,
                'middle_name' => $mi,
                'last_name' => $lName,
                'suffix' => $suf
            ]);
        }
    }

    public function down()
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['middle_name', 'suffix']);
        });
    }
};