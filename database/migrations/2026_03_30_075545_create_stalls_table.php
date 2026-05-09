<?php
// /database\migrations\2026_03_30_075545_create_stalls_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('stalls', function (Blueprint $table) {
            $table->id();
            $table->string('stall_code');
            $table->string('section')->nullable();
            $table->string('classification')->nullable();
            $table->string('stall_type')->default('sqm_based');

            $table->decimal('size_sqm', 8, 2)->default(0);
            $table->decimal('current_monthly_rental', 10, 2)->default(0);
            $table->decimal('current_rate_per_sqm', 10, 2)->default(0);
            $table->decimal('proposed_monthly_rental', 10, 2)->default(0);
            $table->decimal('proposed_rate_per_sqm', 10, 2)->default(0);
            $table->decimal('fixed_rate', 10, 2)->nullable();

            $table->foreignId('building_id')->constrained()->cascadeOnDelete();
            $table->foreignId('floor_id')->constrained()->cascadeOnDelete();
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->unique(['stall_code', 'floor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stalls');
    }
};
