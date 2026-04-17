<?php
//database/migrations/2026_03_30_075545_create_stalls_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {
        Schema::create('stalls', function (Blueprint $table) {
            $table->id();
            $table->string('stall_code');
            $table->foreignId('building_id')->constrained()->cascadeOnDelete();
            $table->foreignId('floor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('status_id')->constrained('statuses');
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->unique(['stall_code', 'building_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stalls');
    }
};
