<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCommerceFieldsToProductsTable extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Manufacturer's Retail Price (used for "compare-at" / sale strikethrough)
            $table->unsignedDecimal('mrp', 10, 2)->nullable()->after('price');
            $table->unsignedInteger('stock')->default(0)->after('mrp');
            $table->string('slug')->nullable()->unique()->after('name');
            $table->index('category');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn(['mrp', 'stock', 'slug']);
        });
    }
}
