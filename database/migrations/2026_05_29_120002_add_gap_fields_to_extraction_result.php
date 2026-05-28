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
        Schema::table('extraction_result', function (Blueprint $table) {
            $table->text('novelty_gap')->nullable()->after('recommendation');
            $table->text('future_research')->nullable()->after('novelty_gap');
            $table->text('limitation')->nullable()->after('future_research');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('extraction_result', function (Blueprint $table) {
            $table->dropColumn(['novelty_gap', 'future_research', 'limitation']);
        });
    }
};
