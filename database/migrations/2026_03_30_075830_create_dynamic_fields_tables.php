<?php
//database\migrations\2026_03_30_075830_create_dynamic_fields_tables.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('field_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('label');
            $table->string('type');
            $table->string('module');
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('field_id')->constrained('field_definitions')->cascadeOnDelete();
            $table->unsignedBigInteger('record_id');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->index(['field_id', 'record_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dynamic_fields_tables');
    }
};
