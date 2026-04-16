<?php
//database\migrations\2026_04_04_090214_add_description_to_floors_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('floors', function (Blueprint $table) {
            if (!Schema::hasColumn('floors', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
        });
    }

    public function down()
    {
        Schema::table('floors', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};
