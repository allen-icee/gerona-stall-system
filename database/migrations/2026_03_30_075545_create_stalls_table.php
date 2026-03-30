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
        Schema::create('stalls', function (Blueprint $table) {
            $table->id();
            $table->string('stall_code')->unique(); // e.g., B1, B2
            $table->foreignId('building_id')->constrained()->cascadeOnDelete();
            $table->foreignId('floor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('status_id')->constrained('statuses'); // Links to Legend
            $table->integer('version')->default(1); // For Optimistic Locking
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stalls');
    }
};
