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
        Schema::create('research_plans', function (Blueprint $table) {

            $table->id('research_plan_id');

            $table->string('title');

            $table->integer('scopus_quantity')->nullable();

            $table->integer('pubmed_quantity')->nullable();

            $table->integer('extraction_count')->nullable();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_plans');
    }
};
