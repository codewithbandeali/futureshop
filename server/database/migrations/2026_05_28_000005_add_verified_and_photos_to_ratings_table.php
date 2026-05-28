<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Trust signals on product reviews:
 *  - `verified` boolean: set automatically at write-time when the
 *    reviewing user has at least one delivered/paid order containing
 *    this product. Renders as the Amazon-style "Verified Purchase"
 *    badge on the storefront.
 *  - `photos` JSON: array of image URLs uploaded with the review.
 *    Renders as a horizontal photo strip inside the review card.
 *
 * Both default to safe values (false / null) so existing reviews keep
 * rendering unchanged.
 */
class AddVerifiedAndPhotosToRatingsTable extends Migration
{
    public function up()
    {
        Schema::table('ratings', function (Blueprint $table) {
            if (! Schema::hasColumn('ratings', 'verified')) {
                $table->boolean('verified')->default(false)->after('review');
            }
            if (! Schema::hasColumn('ratings', 'photos')) {
                $table->json('photos')->nullable()->after('verified');
            }
        });
    }

    public function down()
    {
        Schema::table('ratings', function (Blueprint $table) {
            if (Schema::hasColumn('ratings', 'photos')) {
                $table->dropColumn('photos');
            }
            if (Schema::hasColumn('ratings', 'verified')) {
                $table->dropColumn('verified');
            }
        });
    }
}
