<?php

namespace App\Console\Commands;

use App\Models\Image;
use App\Models\Product;
use App\Models\Thumbnail;
use App\Services\CloudinaryService;
use Illuminate\Console\Command;

/**
 * One-shot maintenance command. After running `db:seed`, the catalog ships
 * with Unsplash hot-linked URLs. For long-term hosting (CDN consistency,
 * permanent caching, control over invalidation) you typically want those
 * assets on your own Cloudinary cloud.
 *
 * Run:
 *     php artisan products:upload-images-to-cloudinary
 *
 * Idempotent — only uploads URLs that don't already live on res.cloudinary.com.
 * Safe to run repeatedly; only newly-added external URLs get uploaded.
 *
 * Requires CLOUDINARY_URL in .env. The /image/upload API works without any
 * account-level toggles (unlike /image/fetch, which is gated by default).
 */
class UploadProductImagesToCloudinary extends Command
{
    protected $signature = 'products:upload-images-to-cloudinary {--dry-run : Show what would be uploaded without actually doing it}';

    protected $description = 'Re-host product images on Cloudinary (replaces Unsplash hot-links with permanent uploads)';

    public function handle(CloudinaryService $cloudinary): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $images = Image::whereNotLike('image', 'https://res.cloudinary.com/%')->get();
        $thumbnails = Thumbnail::whereNotLike('thumbnail', 'https://res.cloudinary.com/%')->get();

        if ($images->isEmpty() && $thumbnails->isEmpty()) {
            $this->info('Nothing to do — every image already lives on Cloudinary.');
            return self::SUCCESS;
        }

        $this->info(sprintf(
            '%s %d image(s) and %d thumbnail(s)…',
            $dryRun ? 'Would upload' : 'Uploading',
            $images->count(),
            $thumbnails->count()
        ));

        $uploaded = 0;
        foreach ($images as $img) {
            if ($dryRun) {
                $this->line("  [image #{$img->id}] {$img->image}");
                continue;
            }
            try {
                $result = $cloudinary->uploadFromUrl($img->image, "product-{$img->product_id}-img-{$img->id}");
                $img->image = $result['url'];
                $img->save();
                $uploaded++;
                $this->line("  ✓ image #{$img->id} → {$result['url']}");
            } catch (\Throwable $e) {
                $this->error("  ✗ image #{$img->id} failed: {$e->getMessage()}");
            }
        }

        foreach ($thumbnails as $t) {
            if ($dryRun) {
                $this->line("  [thumb product:{$t->product_id}] {$t->thumbnail}");
                continue;
            }
            try {
                $result = $cloudinary->uploadFromUrl($t->thumbnail, "product-{$t->product_id}-thumb");
                $t->thumbnail = $result['url'];
                $t->save();
                $uploaded++;
                $this->line("  ✓ thumbnail product:{$t->product_id} → {$result['url']}");
            } catch (\Throwable $e) {
                $this->error("  ✗ thumbnail product:{$t->product_id} failed: {$e->getMessage()}");
            }
        }

        if ($dryRun) {
            $this->info('Dry run complete. Re-run without --dry-run to actually upload.');
        } else {
            $this->info("Done — uploaded {$uploaded} asset(s) to Cloudinary.");
        }
        return self::SUCCESS;
    }
}
