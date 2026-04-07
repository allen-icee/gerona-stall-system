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
        Schema::table('payments', function (Blueprint $table) {
            // Tie every payment to an Official Receipt Number
            $table->string('or_number')->nullable()->after('amount');

            // Distinguish between when the payment was RECORDED vs when it was actually PAID
            $table->date('payment_date')->nullable()->after('or_number');

            // Add a field for the Treasury collector's name or notes
            $table->string('received_by')->nullable()->after('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            //
        });
    }
};
