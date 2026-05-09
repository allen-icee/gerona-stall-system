<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // 1. Wipe out duplicate cells so we can safely apply the unique constraint
        DB::statement('
            DELETE t1 FROM layout_cells t1
            INNER JOIN layout_cells t2
            WHERE t1.id > t2.id
            AND t1.layout_id = t2.layout_id
            AND t1.row_number = t2.row_number
            AND t1.column_number = t2.column_number
        ');

        Schema::table('layout_cells', function (Blueprint $table) {
            // 2. Add the columns to save merged cell dimensions
            $table->integer('col_span')->default(1)->after('text');
            $table->integer('row_span')->default(1)->after('col_span');

            // 3. Add the unique constraint so Laravel updates instead of duplicates!
            $table->unique(['layout_id', 'row_number', 'column_number'], 'layout_cells_unique_index');
        });
    }

    public function down()
    {
        Schema::table('layout_cells', function (Blueprint $table) {
            $table->dropUnique('layout_cells_unique_index');
            $table->dropColumn(['col_span', 'row_span']);
        });
    }
};
