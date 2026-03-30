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
        Schema::create('layout_cells', function (Blueprint $table) {
            $table->id();
            $table->foreignId('layout_id')->constrained()->cascadeOnDelete();
            $table->integer('row_number');
            $table->integer('column_number');
            $table->string('type')->default('stall'); // stall, walkway, restroom, vacant
            $table->foreignId('stall_id')->nullable()->constrained('stalls')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('layout_cells');
    }
};
