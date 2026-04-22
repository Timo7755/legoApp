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
        Schema::create('lego_parts', function (Blueprint $table) {
          
            $table->string("part_num")->primary();
            $table->string("name");
            $table->integer("part_cat_id")->nullable();
            $table->string("img_url")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lego_parts');
    }
};
