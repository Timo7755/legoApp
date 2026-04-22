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
        Schema::create('user_parts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->foreign("user_id")->references("id")->on("users")->cascadeOnDelete();
            $table->string("part_num");
            $table->foreign("part_num")->references("part_num")->on("lego_parts")->cascadeOnDelete();
            $table->integer("color_id");
            $table->foreign("color_id")->references("id")->on("lego_colors")->cascadeOnDelete();
            $table->unique(['user_id', 'part_num', 'color_id']);
            $table->integer("quantity_owned");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_parts');
    }
};
