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
            $table->id('filtered_article_id');
            $table->unsignedBigInteger('raw_article_id');
            $table->unsignedBigInteger('research_plan_id');

            $table->enum('novelty_status', ['novelty', 'not_novelty'])->nullable();
            $table->enum('article_status', ['screening', 'eligible', 'excluded', 'included'])->default('included');
            $table->boolean('included')->default(true);
            $table->enum('retrieved', ['Retrieved', 'Not Retrieved'])->default('Not Retrieved');
            $table->enum('ai_usage_status', ['used', 'not_used'])->default('not_used');

            $table->timestamps();

            $table->foreign('raw_article_id')
                ->references('article_id')
                ->on('raw_articles')
                ->onDelete('cascade');
                
            $table->foreign('research_plan_id')
                ->references('research_plan_id')
                ->on('research_plans')
                ->onDelete('cascade');
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
