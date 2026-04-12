<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Safely check if the column exists before adding it
            if (!Schema::hasColumn('payments', 'or_number')) {
                $table->string('or_number')->nullable()->after('amount');
            }

            // Assuming there's an encoded_by field based on your User.php relationships
            if (!Schema::hasColumn('payments', 'encoded_by')) {
                $table->foreignId('encoded_by')->nullable()->constrained('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
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
