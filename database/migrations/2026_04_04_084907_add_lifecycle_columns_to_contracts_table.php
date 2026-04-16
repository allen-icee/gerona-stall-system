<?php
//database\migrations\2026_04_04_084907_add_lifecycle_columns_to_contracts_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('contracts', function (Blueprint $table) {

            if (!Schema::hasColumn('contracts', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('security_deposit');
            }

            if (!Schema::hasColumn('contracts', 'permit_status')) {
                $table->string('permit_status')->default('PENDING')->after('is_active');
            }
        });
    }

    public function down()
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'permit_status']);
        });
    }
};
