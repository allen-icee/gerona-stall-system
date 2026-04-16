<?php
//database\migrations\2026_03_30_075733_create_payments_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
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

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
