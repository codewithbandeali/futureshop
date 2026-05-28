<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds two new media fields to products:
 *  - video_url: optional product demo (HTML5 mp4, YouTube, or Vimeo URL).
 *  - view_360_urls: JSON array of sequential frame URLs that the 360
 *    spinner widget cycles through (typical: 24-72 frames).
 *
 * Both default to NULL; the storefront feature-detects and hides the
 * affordance when the data is absent.
 */
class AddMediaFieldsToProductsTable extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'video_url')) {
                $table->string('video_url', 512)->nullable()->after('options');
            }
            if (! Schema::hasColumn('products', 'view_360_urls')) {
                $table->json('view_360_urls')->nullable()->after('video_url');
            }
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'view_360_urls')) {
                $table->dropColumn('view_360_urls');
            }
            if (Schema::hasColumn('products', 'video_url')) {
                $table->dropColumn('video_url');
            }
        });
    }
}
