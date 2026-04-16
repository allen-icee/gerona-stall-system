<?php
//database\migrations\2026_04_06_054218_add_pricing_logic_to_stalls_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::table('stalls', function (Blueprint $table) {

            $table->string('section')->nullable()->after('stall_code');

            $table->string('classification')->nullable()->after('section');

            $table->string('stall_type')->default('sqm_based')->after('classification');

            $table->decimal('fixed_rate', 10, 2)->nullable()->after('rate_per_sqm');
        });
    }

    public function down(): void
    {
        Schema::table('stalls', function (Blueprint $table) {
            $table->dropColumn([
                'section',
                'classification',
                'stall_type',
                'fixed_rate'
            ]);
        });
    }
};
