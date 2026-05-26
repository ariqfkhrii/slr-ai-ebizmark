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
        Schema::create('review', function (Blueprint $table) {
            $table->id('review_id');
            $table->unsignedBigInteger('article_id');
            $table->unsignedBigInteger('country_id')->nullable();
            $table->date('received_date')->nullable();
            $table->date('accepted_date')->nullable();
            $table->date('published_date')->nullable();
            $table->timestamps();

            $table->unique('article_id', 'review_article_unique');

            $table->foreign('article_id')
                ->references('filtered_article_id')
                ->on('filtered_articles')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review');
    }
};
