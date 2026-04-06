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
        Schema::create('violations', function (Blueprint $table) {
            $table->id();

            // Link directly to the active contract
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();

            // What did they do? (e.g., "Illegal Extension", "Unpaid Garbage Fee")
            $table->string('violation_type');

            // When was it issued?
            $table->date('date_issued');

            // Status of the violation: Active, Resolved, Penalized
            $table->string('status')->default('Active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('violations');
    }
};