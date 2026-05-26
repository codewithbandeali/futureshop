<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderItemsTable extends Migration
{
    public function up()
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->unsignedInteger('quantity');
            $table->unsignedDecimal('unit_price', 10, 2);
            $table->unsignedDecimal('line_total', 10, 2);
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_items');
    }
}
