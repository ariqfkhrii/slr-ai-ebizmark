<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('DELETE fa1 FROM filtered_articles fa1 INNER JOIN filtered_articles fa2 ON fa1.raw_article_id = fa2.raw_article_id AND fa1.research_plan_id = fa2.research_plan_id AND fa1.filtered_article_id < fa2.filtered_article_id');

        Schema::table('filtered_articles', function (Blueprint $table) {
            $table->unique(['raw_article_id', 'research_plan_id'], 'filtered_articles_raw_plan_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('filtered_articles', function (Blueprint $table) {
            $table->dropUnique('filtered_articles_raw_plan_unique');
        });
    }
};
