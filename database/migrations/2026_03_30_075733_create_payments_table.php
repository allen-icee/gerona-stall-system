<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // The ONLY relational link we need.
            // Through the contract, we already know the exact Stall and Tenant!
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();

            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->string('month');
            $table->integer('year');
            $table->string('or_number')->unique();
            $table->foreignId('encoded_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
