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
        Schema::create('lego_sets', function (Blueprint $table) {
            $table->string("set_num")->primary();
            $table->string("name");
            $table->integer("year")->nullable();
            $table->integer('theme_id')->nullable();
            $table->foreign('theme_id')->references('id')->on('lego_themes')->nullOnDelete();
            $table->integer("num_parts")->nullable();
            $table->string("img_url")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lego_sets');
    }
};
