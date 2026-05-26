<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('address_id')->nullable()->constrained()->nullOnDelete();

            $table->string('status', 32)->default('pending');
            $table->unsignedDecimal('subtotal', 10, 2);
            $table->unsignedDecimal('shipping', 10, 2)->default(0);
            $table->unsignedDecimal('tax', 10, 2)->default(0);
            $table->unsignedDecimal('total', 10, 2);
            $table->string('currency', 3)->default('USD');

            $table->string('payment_method', 32)->nullable();
            $table->string('payment_status', 32)->default('unpaid');
            $table->string('payment_reference')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
