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
        // For Toggling Features (e.g., "new_rent_logic")
        Schema::create('feature_flags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_enabled')->default(false);
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // The Audit Trail (Crucial for Government)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // create, update, delete
            $table->string('module'); // stalls, payments, tenants
            $table->unsignedBigInteger('record_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_controls_tables');
    }
};
