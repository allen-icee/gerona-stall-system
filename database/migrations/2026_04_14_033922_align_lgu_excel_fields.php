<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Update Stalls Table
        Schema::table('stalls', function (Blueprint $table) {
            if (!Schema::hasColumn('stalls', 'current_monthly_rental')) {
                $table->decimal('current_monthly_rental', 10, 2)->default(0)->after('size_sqm');
                $table->decimal('current_rate_per_sqm', 10, 2)->default(0)->after('current_monthly_rental');
                $table->decimal('proposed_monthly_rental', 10, 2)->default(0)->after('current_rate_per_sqm');
                $table->decimal('proposed_rate_per_sqm', 10, 2)->default(0)->after('proposed_monthly_rental');
            }
        });

        // 2. Update Contracts Table (Handles Deposits and Ownership)
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'correct_deposit')) {
                $table->decimal('correct_deposit', 10, 2)->default(0);
                $table->decimal('current_deposit', 10, 2)->default(0);
                // Variance is computed: Correct - Current, so we don't need a DB column for it!
                $table->string('deposit_name')->nullable();
                $table->decimal('payables_with_penalty', 10, 2)->default(0);
                $table->boolean('is_new_owner')->default(false);
            }
        });
    }

    public function down(): void
    {
        // Safe down method
    }
};