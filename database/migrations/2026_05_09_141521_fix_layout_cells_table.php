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
            DELETE FROM layout_cells
            WHERE id NOT IN (
                SELECT id FROM (
                    SELECT MIN(id) AS id
                    FROM layout_cells
                    GROUP BY layout_id, row_number, column_number
                ) AS cells_to_keep
            )
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
