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
        Schema::create('article_metadata_temps', function (Blueprint $table) {
            $table->id();
            $table->string('batch_id')->nullable();
            $table->string('cache_key')->nullable();
            $table->foreignId('raw_article_id')->nullable()->constrained()->onDelete('set null');
            $table->string('status')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_metadata_temps');
    }
};
