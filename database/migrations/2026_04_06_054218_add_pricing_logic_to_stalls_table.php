<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stalls', function (Blueprint $table) {
            // 🏷️ Categorization (Based on the Excel Summary logic)
            $table->string('section')->nullable()->after('stall_code');
            // e.g., Fish, Meat, Vegetables, Dry Goods

            $table->string('classification')->nullable()->after('section');
            // e.g., A, B, C

            // ⚙️ The Pricing Engine Control
            $table->string('stall_type')->default('sqm_based')->after('classification');
            // Values will be: 'sqm_based', 'class_based', or 'manual'

            // 💰 Rates (Note: size_sqm and rate_per_sqm already exist in your DB!)
            $table->decimal('fixed_rate', 10, 2)->nullable()->after('rate_per_sqm');
        });
    }

    /**
     * Reverse the migrations.
     */
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