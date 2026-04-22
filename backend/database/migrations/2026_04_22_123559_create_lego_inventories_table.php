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
        Schema::create('lego_inventories', function (Blueprint $table) {
            $table->id();
            $table->string("set_num");
            $table->foreign("set_num")->references("set_num")->on("lego_sets")->cascadeOnDelete();
            $table->integer("version");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lego_inventories');
    }
};
