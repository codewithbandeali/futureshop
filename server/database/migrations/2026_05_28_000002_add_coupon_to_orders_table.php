<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Record which coupon was applied to an order and how much it discounted.
 * `coupon_id` is NULL when no code was used. `discount` is the amount in
 * money (not the percentage) so reports don't need to re-evaluate the
 * coupon definition each time.
 */
class AddCouponToOrdersTable extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'coupon_id')) {
                $table->foreignId('coupon_id')->nullable()->after('address_id')->constrained()->nullOnDelete();
            }
            if (! Schema::hasColumn('orders', 'discount')) {
                $table->unsignedDecimal('discount', 10, 2)->default(0)->after('shipping');
            }
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'coupon_id')) {
                $table->dropForeign(['coupon_id']);
                $table->dropColumn('coupon_id');
            }
            if (Schema::hasColumn('orders', 'discount')) {
                $table->dropColumn('discount');
            }
        });
    }
}
