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
            $table->id();
            $table->string('doi')->unique()->nullable();
            $table->string('title');
            $table->text('author')->nullable();
            $table->text('keyword')->nullable();
            $table->text('abstract')->nullable();
            $table->string('issn_print', 16)->nullable();
            $table->string('issn_e', 16)->nullable();
            $table->string('tier', 2)->nullable();
            $table->unsignedInteger('citation_count')->nullable();
            $table->unsignedSmallInteger('publish_year')->nullable();
            $table->string('source_db')->nullable();
            $table->timestamps();
            
            $table->index('tier');
            $table->index('publish_year');
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
