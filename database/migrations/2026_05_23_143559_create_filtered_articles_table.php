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
        Schema::create('filtered_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_plan_id')->constrained('research_plans', 'research_plan_id')->onDelete('cascade');
            $table->foreignId('raw_article_id')->constrained()->onDelete('cascade');
            $table->foreignId('keyword_id')->constrained('keywords', 'id')->onDelete('cascade');
            $table->float('similarity_score')->nullable();
            $table->boolean('included')->default(false);
            $table->boolean('retrieved')->default(false);
            $table->boolean('novelty_status')->default(false);
            $table->boolean('ai_usage_status')->default(false);
            $table->string('article_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filtered_articles');
    }
};
