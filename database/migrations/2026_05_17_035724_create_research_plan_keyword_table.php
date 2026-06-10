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
        Schema::create('research_plan_keyword', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_plan_id')->constrained('research_plans', 'research_plan_id')->onDelete('cascade');
            $table->foreignId('keyword_id')->constrained()->onDelete('cascade');
            $table->integer('article_count')->default(0);
            $table->integer('duplicate_count')->default(0);
            $table->integer('unmatched_tier_count')->default(0);
            $table->integer('missing_doi_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_plan_keyword');
    }
};
