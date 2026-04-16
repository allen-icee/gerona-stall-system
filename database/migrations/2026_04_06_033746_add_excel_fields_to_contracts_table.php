<?php
//database\migrations\2026_04_06_033746_add_excel_fields_to_contracts_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {

            $table->string('document_status')->nullable()->after('is_active');

            $table->text('remarks')->nullable()->after('permit_status');

            $table->decimal('deposit_paid', 12, 2)->default(0)->after('security_deposit');
            $table->string('deposit_reference')->nullable()->after('deposit_paid');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn([
                'document_status',
                'remarks',
                'deposit_paid',
                'deposit_reference',
            ]);
        });
    }
};
