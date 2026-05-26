<?php

namespace Tests\Unit;

use App\Services\CloudinaryService;
use ReflectionClass;
use Tests\TestCase;

/**
 * Unit test for the URL-building bit of the service — we don't hit Cloudinary
 * here. Integration with the real SDK is covered by a manual smoke test, not
 * automated, because it would require live network + a test cloud.
 */
class CloudinaryServiceTest extends TestCase
{
    public function test_url_builder_appends_default_transforms(): void
    {
        config(['cloudinary.cloud_name' => 'demo']);
        config(['cloudinary.default_transformations' => 'f_auto,q_auto']);

        $svc = new CloudinaryService();
        $url = $svc->url('futureshop/products/sample');

        $this->assertEquals(
            'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/futureshop/products/sample',
            $url
        );
    }

    public function test_url_builder_respects_custom_transforms(): void
    {
        config(['cloudinary.cloud_name' => 'demo']);

        $svc = new CloudinaryService();
        $url = $svc->url('id', 'w_400,c_fill');

        $this->assertStringContainsString('w_400,c_fill', $url);
    }
}
