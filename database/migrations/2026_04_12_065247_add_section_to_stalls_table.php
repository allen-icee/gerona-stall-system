<?php
//database\migrations\2026_04_12_065247_add_section_to_stalls_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('stalls', function (Blueprint $table) {

            if (!Schema::hasColumn('stalls', 'section')) {
                $table->string('section')->nullable()->after('stall_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stalls', function (Blueprint $table) {
            if (Schema::hasColumn('stalls', 'section')) {
                $table->dropColumn('section');
            }
        });
    }
};
