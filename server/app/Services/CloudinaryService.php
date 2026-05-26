<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;

/**
 * Thin wrapper around the Cloudinary SDK so the rest of the app talks to
 * an interface we own. Two reasons:
 *   1. If we ever swap providers (S3+Lambda, ImageKit, etc.) we change one file.
 *   2. Upload defaults (folder, format, eager transforms) live in one place
 *      instead of being duplicated across controllers.
 */
class CloudinaryService
{
    public function upload(UploadedFile $file, ?string $publicId = null): array
    {
        $folder = config('cloudinary.upload_folder', 'futureshop/products');

        $options = [
            'folder' => $folder,
            'resource_type' => 'image',
            'overwrite' => true,
            'invalidate' => true,
        ];
        if ($publicId) {
            $options['public_id'] = $publicId;
        }

        $result = Cloudinary::upload($file->getRealPath(), $options);

        return [
            'public_id' => $result->getPublicId(),
            'url' => $this->transform($result->getSecurePath()),
            'raw_url' => $result->getSecurePath(),
            'width' => $result->getWidth(),
            'height' => $result->getHeight(),
        ];
    }

    /**
     * Upload from a remote URL using Cloudinary's "fetch" — saves a round-trip
     * through our server when we already have a manufacturer press-kit URL.
     */
    public function uploadFromUrl(string $sourceUrl, ?string $publicId = null): array
    {
        $folder = config('cloudinary.upload_folder', 'futureshop/products');

        $options = [
            'folder' => $folder,
            'resource_type' => 'image',
            'overwrite' => false,
            'invalidate' => false,
        ];
        if ($publicId) {
            $options['public_id'] = $publicId;
        }

        $result = Cloudinary::upload($sourceUrl, $options);

        return [
            'public_id' => $result->getPublicId(),
            'url' => $this->transform($result->getSecurePath()),
            'raw_url' => $result->getSecurePath(),
        ];
    }

    /**
     * Generate a delivery URL for an existing public_id with default
     * transforms applied. Useful when storing only the public_id in the DB.
     */
    public function url(string $publicId, string $transformations = null): string
    {
        $cloud = config('cloudinary.cloud_name');
        $tx = $transformations ?? config('cloudinary.default_transformations', 'f_auto,q_auto');
        return "https://res.cloudinary.com/{$cloud}/image/upload/{$tx}/{$publicId}";
    }

    public function destroy(string $publicId): bool
    {
        try {
            Cloudinary::destroy($publicId);
            return true;
        } catch (\Throwable $e) {
            // Asset may already be gone; don't break the controller flow.
            report($e);
            return false;
        }
    }

    /**
     * Append the default transformation segment to a Cloudinary URL if it
     * doesn't already have one. Returns the URL unchanged if it's not a
     * Cloudinary URL (e.g. external placeholders during dev).
     */
    private function transform(string $url): string
    {
        if (!str_contains($url, '/image/upload/')) {
            return $url;
        }
        $tx = config('cloudinary.default_transformations', 'f_auto,q_auto');
        return preg_replace('#/image/upload/#', "/image/upload/{$tx}/", $url, 1);
    }
}
