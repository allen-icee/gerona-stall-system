<?php
//database\migrations\2026_04_16_010224_simplify_contract_deposits_and_add_payment_types.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {

        Schema::table('contracts', function (Blueprint $table) {

            $table->dropColumn(['correct_deposit', 'current_deposit', 'deposit_name', 'security_deposit']);

            $table->decimal('deposit_required', 10, 2)->default(0)->after('monthly_rent');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_type')->default('rent')->after('amount');
        });
    }

    public function down()
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn('deposit_required');
            $table->decimal('security_deposit', 10, 2)->nullable();
            $table->decimal('correct_deposit', 10, 2)->nullable();
            $table->decimal('current_deposit', 10, 2)->nullable();
            $table->string('deposit_name')->nullable();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('payment_type');
        });
    }
};
