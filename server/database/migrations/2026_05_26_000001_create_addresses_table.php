<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAddressesTable extends Migration
{
    public function up()
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('phone', 32);
            $table->string('line1');
            $table->string('line2')->nullable();
            $table->string('city');
            $table->string('state', 64)->nullable();
            $table->string('postal_code', 20);
            $table->string('country', 2)->default('US');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_default']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('addresses');
    }
}
