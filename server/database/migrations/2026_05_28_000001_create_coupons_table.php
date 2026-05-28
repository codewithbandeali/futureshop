<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Coupons — the real backing table for the NEW20 banner and any future
 * promo codes. Kept deliberately simple: percentage OR fixed amount, an
 * expiry, and a couple of audience flags (first-order only, members only).
 *
 * Stock-keeping idea: `usage_limit` is the total times the code can be
 * redeemed across all customers. `usage_count` is incremented inside the
 * order transaction. NULL `usage_limit` = unlimited.
 */
class CreateCouponsTable extends Migration
{
    public function up()
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('description')->nullable();

            $table->enum('discount_type', ['percent', 'fixed'])->default('percent');
            $table->unsignedDecimal('discount_value', 8, 2);

            // Constraints
            $table->unsignedDecimal('min_subtotal', 10, 2)->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_count')->default(0);

            // Audience flags
            $table->boolean('first_order_only')->default(false);
            $table->boolean('is_public')->default(true);
            $table->boolean('active')->default(true);

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('active');
            $table->index('expires_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('coupons');
    }
}
