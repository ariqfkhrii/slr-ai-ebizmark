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
        Schema::create('extraction_result', function (Blueprint $table) {
            $table->id('extraction_id');
            $table->unsignedBigInteger('review_id');

            $table->text('abstract')->nullable();
            $table->longText('introduction')->nullable();
            $table->text('result')->nullable();
            $table->text('conclusion')->nullable();
            $table->text('recommendation')->nullable();

            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->enum('input_method', ['manual', 'ai', 'hybrid'])->default('manual');
            $table->enum('validation_status', ['pending', 'validated', 'corrected', 'rejected'])
                ->default('pending');
            $table->timestamps();

            $table->unique('review_id', 'extraction_result_review_unique');

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
        Schema::dropIfExists('extraction_result');
    }
};
