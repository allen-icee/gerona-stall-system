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
        Schema::table('contracts', function (Blueprint $table) {
            // --- EEDO / Admin Fields ---
            // Placed after 'is_active' (since 'status' doesn't exist)
            $table->string('document_status')->nullable()->after('is_active');

            // NOTE: We removed adding 'permit_status' here because your original table already has it!

            // General notes
            $table->text('remarks')->nullable()->after('permit_status');

            // --- Treasury Fields ---
            // Placed after 'security_deposit'
            $table->decimal('deposit_paid', 12, 2)->default(0)->after('security_deposit');
            $table->string('deposit_reference')->nullable()->after('deposit_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn([
                'document_status',
                'remarks',
                'deposit_paid',
                'deposit_reference',
            ]);
        });
    }
};