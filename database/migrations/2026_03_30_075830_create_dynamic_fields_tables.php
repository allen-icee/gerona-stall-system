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
        Schema::create('field_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., business_permit_no
            $table->string('label'); // e.g., "Business Permit Number"
            $table->string('type'); // text, number, date, boolean
            $table->string('module'); // 'stall', 'tenant', or 'contract'
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('field_id')->constrained('field_definitions')->cascadeOnDelete();
            $table->unsignedBigInteger('record_id'); // ID of the stall, tenant, or contract
            $table->text('value')->nullable();
            $table->timestamps();

            // Index for faster lookups
            $table->index(['field_id', 'record_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dynamic_fields_tables');
    }
};
