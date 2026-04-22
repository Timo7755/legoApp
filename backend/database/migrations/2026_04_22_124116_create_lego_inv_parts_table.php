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
        Schema::create('lego_inv_parts', function (Blueprint $table) {
            $table->id();
            $table->integer("inventory_id");
            $table->foreign("inventory_id")->references("id")->on("lego_inventories")->cascadeOnDelete();
            $table->string("part_num");
            $table->foreign("part_num")->references("part_num")->on("lego_parts")->cascadeOnDelete();
            $table->integer("color_id");
            $table->foreign("color_id")->references("id")->on("lego_colors")->cascadeOnDelete();
            $table->integer("quantity");
            $table->boolean("is_spare")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lego_inv_parts');
    }
};
