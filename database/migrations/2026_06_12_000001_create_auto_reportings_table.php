<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auto_reportings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_plan_id')
                ->constrained('research_plans', 'research_plan_id')
                ->cascadeOnDelete();
            $table->string('chapter');
            $table->string('title');
            $table->text('detail');
            $table->longText('generated_content')->nullable();
            $table->unsignedInteger('word_count')->nullable();
            $table->unsignedInteger('order_no');
            $table->string('status')->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auto_reportings');
    }
};
