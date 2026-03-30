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
            $table->foreignId('stall_id')->constrained();
            $table->foreignId('tenant_id')->constrained();
            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->string('month'); // e.g., JAN, FEB
            $table->integer('year');
            $table->string('or_number')->unique(); // Official Receipt
            $table->foreignId('encoded_by')->constrained('users'); // Tracks which Treasury staff encoded it
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
