<?php
//database\migrations\2026_04_04_090732_cleanup_stalls_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('stalls', function (Blueprint $table) {
            if (Schema::hasColumn('stalls', 'status_id')) {

                $table->dropForeign(['status_id']);

                $table->dropColumn('status_id');
            }
        });

        if (Schema::hasColumn('stalls', 'size_sqm')) {
            DB::statement('ALTER TABLE stalls MODIFY size_sqm DECIMAL(8,2) DEFAULT 0');
        }

        if (Schema::hasColumn('stalls', 'rate_per_sqm')) {
            DB::statement('ALTER TABLE stalls MODIFY rate_per_sqm DECIMAL(10,2) DEFAULT 0');
        }
    }

    public function down()
    {
        // No down method needed
    }
};
