<?php

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
                // 1. Cut the foreign key link first!
                // Passing it as an array lets Laravel automatically calculate the name 'stalls_status_id_foreign'
                $table->dropForeign(['status_id']);

                // 2. Now it is safe to drop the column
                $table->dropColumn('status_id');
            }
        });

        // 3. Ensure size and rate columns default to 0
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
