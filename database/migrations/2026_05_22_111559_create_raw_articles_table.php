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
        Schema::create('raw_articles', function (Blueprint $table) {
            $table->id('article_id');
            $table->string('doi', 255)->unique();
            $table->text('title');
            $table->string('issn', 50)->nullable();
            $table->text('abstract')->nullable();
            $table->year('publish_year')->nullable();
            $table->unsignedBigInteger('country_id')->nullable();
            $table->string('tier', 50)->nullable();
            $table->integer('citation_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raw_articles');
    }
};
