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
        Schema::create('classification_setup', function (Blueprint $table) {
            $table->id('id_setup');
            $table->unsignedBigInteger('research_plan_id');
            $table->string('category_1')->nullable();
            $table->string('category_2')->nullable();
            $table->string('category_3')->nullable();
            $table->string('category_4')->nullable();
            $table->string('category_5')->nullable();
            $table->string('category_6')->nullable();
            $table->text('theory')->nullable();
            $table->timestamps();

            $table->unique('research_plan_id', 'classification_setup_plan_unique');

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
        Schema::dropIfExists('classification_setup');
    }
};
