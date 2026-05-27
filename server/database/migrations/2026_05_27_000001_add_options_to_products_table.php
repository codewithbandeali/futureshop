<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Soft product variants — for computer hardware shops, customers expect
 * to pick a storage tier and a colour on the PDP. We avoid a full
 * `product_variants` table (which would need per-variant SKU + per-variant
 * stock) and instead store the available choices as JSON on the product.
 *
 * Shape:
 *   {
 *     "storage": ["256GB", "512GB", "1TB"],
 *     "color":   ["Midnight", "Silver", "Starlight"]
 *   }
 *
 * Selection is recorded in the cart line as metadata; stock and price
 * remain at the product level. When per-variant pricing/inventory becomes
 * a real requirement, this column gets replaced by a `product_variants`
 * table — the API resource shape stays the same.
 */
class AddOptionsToProductsTable extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('options')->nullable()->after('colors');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('options');
        });
    }
}
