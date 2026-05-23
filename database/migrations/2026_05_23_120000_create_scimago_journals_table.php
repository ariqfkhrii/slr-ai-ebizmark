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
        Schema::create('scimago_journals', function (Blueprint $table) {
            $table->id();
            $table->string('source_id')->unique();
            $table->string('title');
            $table->string('issn_print', 16)->nullable();
            $table->string('issn_e', 16)->nullable();
            $table->string('best_quartile', 2)->nullable();
            $table->timestamps();

            $table->index('issn_print');
            $table->index('issn_e');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scimago_journals');
    }
};
