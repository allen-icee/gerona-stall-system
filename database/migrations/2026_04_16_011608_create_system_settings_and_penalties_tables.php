<?php
//database\migrations\2026_04_16_011608_create_system_settings_and_penalties_tables.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('value');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        DB::table('system_settings')->insert([
            ['key' => 'penalty_auto_generate', 'value' => 'true', 'description' => 'Allow system to generate pending penalties'],
            ['key' => 'penalty_rate', 'value' => '0.20', 'description' => 'The percentage of base rent charged as a penalty (0.20 = 20%)'],
            ['key' => 'penalty_grace_period_hours', 'value' => '24', 'description' => 'Hours after due date before penalty triggers'],
        ]);

        Schema::create('penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->onDelete('cascade');
            $table->string('month_covered');

            $table->decimal('original_amount', 10, 2);
            $table->decimal('adjusted_amount', 10, 2)->nullable();

            $table->string('status')->default('pending');
            $table->boolean('is_auto_generated')->default(true);
            $table->text('notes')->nullable();

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('penalties');
        Schema::dropIfExists('system_settings');
    }
};
