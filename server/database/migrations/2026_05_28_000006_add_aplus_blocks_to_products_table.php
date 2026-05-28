<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A+ content blocks — Amazon-style enhanced PDP sections that the shop
 * owner can compose without touching code. Stored as a JSON array of
 * blocks; each block is one of:
 *
 *   { "type": "hero",     "heading": "…", "body": "…", "image": "url" }
 *   { "type": "feature",  "heading": "…", "body": "…", "image": "url" }
 *   { "type": "callout",  "heading": "…", "body": "…" }
 *   { "type": "image",    "image": "url", "caption": "…" }
 *
 * The storefront renders blocks in order under the Description tab.
 * Validation is intentionally lenient on the backend — frontend
 * gracefully falls back when a field is missing.
 */
class AddAplusBlocksToProductsTable extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'aplus_blocks')) {
                $table->json('aplus_blocks')->nullable()->after('view_360_urls');
            }
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'aplus_blocks')) {
                $table->dropColumn('aplus_blocks');
            }
        });
    }
}
