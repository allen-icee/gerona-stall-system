<?php
//database\migrations\2026_04_04_093410_add_size_and_rate_to_stalls_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('stalls', function (Blueprint $table) {

            if (!Schema::hasColumn('stalls', 'size_sqm')) {
                $table->decimal('size_sqm', 8, 2)->default(0)->after('stall_code');
            }

            if (!Schema::hasColumn('stalls', 'rate_per_sqm')) {
                $table->decimal('rate_per_sqm', 10, 2)->default(0)->after('size_sqm');
            }
        });
    }

    public function down()
    {
        Schema::table('stalls', function (Blueprint $table) {
            $table->dropColumn(['size_sqm', 'rate_per_sqm']);
        });
    }
};
