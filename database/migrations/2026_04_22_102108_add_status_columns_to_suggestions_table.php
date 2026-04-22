<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suggestions', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected', 'implemented'])->default('pending')->after('description');
            $table->timestamp('reviewed_at')->nullable()->after('status');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete()->after('reviewed_at');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('suggestions', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropIndex(['status']);
            $table->dropColumn(['status', 'reviewed_at', 'reviewed_by']);
        });
    }
};
