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
        Schema::create('article_classification', function (Blueprint $table) {
            $table->id('classification_id');
            $table->unsignedBigInteger('review_id');
            $table->string('category_1')->nullable();
            $table->string('category_2')->nullable();
            $table->string('category_3')->nullable();
            $table->string('category_4')->nullable();
            $table->string('category_5')->nullable();
            $table->string('category_6')->nullable();
            $table->text('grand_theory')->nullable();
            $table->timestamps();

            $table->unique('review_id', 'article_classification_review_unique');

            $table->foreign('review_id')
                ->references('review_id')
                ->on('review')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_classification');
    }
};
