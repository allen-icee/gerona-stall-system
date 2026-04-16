<?php
//database\migrations\2026_04_07_011609_add_audit_fields_to_payments_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {

            if (!Schema::hasColumn('payments', 'or_number')) {
                $table->string('or_number')->nullable()->after('amount');
            }

            if (!Schema::hasColumn('payments', 'encoded_by')) {
                $table->foreignId('encoded_by')->nullable()->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'or_number')) {
                $table->dropColumn('or_number');
            }

            if (Schema::hasColumn('payments', 'encoded_by')) {
                $table->dropForeign(['encoded_by']);
                $table->dropColumn('encoded_by');
            }
        });
    }
};
