<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('layout_cells', function (Blueprint $table) {
            $table->string('text')->nullable()->after('stall_id');
        });
    }

    public function down()
    {
        Schema::table('layout_cells', function (Blueprint $table) {
            $table->dropColumn('text');
        });
    }
};