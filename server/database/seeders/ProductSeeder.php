<?php

namespace Database\Seeders;

use App\Models\Image;
use App\Models\Product;
use App\Models\Thumbnail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * FutureShop catalog: computer hardware.
 * Categories: desktop, laptop, printer, scanner, tablet, monitor
 * Brands:     Apple, Dell, HP, Samsung
 *
 * Image strategy: each product gets a category-appropriate high-quality
 * Unsplash photo, delivered through Cloudinary's fetch CDN so it's
 * automatically converted to WebP/AVIF and cached permanently. Even if
 * the source URL ever 404s, Cloudinary keeps serving the cached copy.
 *
 * For true brand-specific photos, upload via /admin/products/[id]/edit —
 * the row's image URL gets replaced and these defaults disappear.
 */
class ProductSeeder extends Seeder
{
    /** Cloud name from CLOUDINARY_URL — falls back to demo for safety. */
    private function cloudinaryFetch(string $sourceUrl, string $transforms = 'f_auto,q_auto,w_1200,c_fit'): string
    {
        $cloud = $this->cloudName();
        // Cloudinary's /image/fetch/ wants the raw URL appended, NOT urlencoded.
        return "https://res.cloudinary.com/{$cloud}/image/fetch/{$transforms}/{$sourceUrl}";
    }

    private function cloudName(): string
    {
        $name = env('CLOUDINARY_CLOUD_NAME');
        if ($name) return $name;
        $url = env('CLOUDINARY_URL', '');
        if (preg_match('#@([^/]+)#', $url, $m)) return $m[1];
        return 'demo'; // public-readable demo cloud — fallback only
    }

    public function run()
    {
        // Curated HD Unsplash photos (commercial-use, no attribution required).
        // Each URL pulls a ~1200px JPEG; Cloudinary fetch optimises delivery.
        $laptopShots = [
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=85',  // MacBook on wood desk
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=85',  // sleek laptop
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&q=85',  // MacBook open
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=85',  // silver laptop
        ];
        $desktopShots = [
            'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=85',  // PC workstation
            'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=85',  // gaming desktop
            'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=85',     // clean desktop setup
        ];
        $monitorShots = [
            'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=1200&q=85',     // curved monitor
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&q=85',  // dual monitor
            'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=1200&q=85',  // monitor on desk
        ];
        $tabletShots = [
            'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1200&q=85',     // iPad-style tablet
            'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&q=85',     // tablet held
        ];
        $printerShots = [
            'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=1200&q=85',  // office printer
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&q=85',  // tech device
        ];
        $scannerShots = [
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&q=85',  // tech device
            'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=85',     // desk setup
        ];

        // [name, category, brand, price, mrp(null=no sale), stock, description, imagePool]
        $items = [
            // Laptops
            ['Dell XPS 13 (2024)', 'laptop', 'Dell', 1399.00, 1599.00, 14,
                '13.4" InfinityEdge display, Intel Core Ultra 7, 16GB LPDDR5x, 512GB NVMe SSD. Built for mobile productivity with 12-hour battery.', $laptopShots[0]],
            ['HP EliteBook 845 G11', 'laptop', 'HP', 1599.00, 1799.00, 9,
                '14" business laptop with AMD Ryzen 7 Pro, 32GB DDR5, 1TB SSD, vPro security, fingerprint reader.', $laptopShots[1]],
            ['Apple MacBook Air 15"', 'laptop', 'Apple', 1499.00, null, 12,
                'M3 chip, 8-core CPU, 10-core GPU, 16GB unified memory, 512GB SSD. 18-hour battery, silent fanless design.', $laptopShots[2]],
            ['Samsung Galaxy Book4 Pro', 'laptop', 'Samsung', 1349.00, 1499.00, 7,
                '16" 3K AMOLED, Intel Core Ultra 7, 16GB LPDDR5x, 1TB SSD. Co-pilot+ PC certified.', $laptopShots[3]],

            // Desktops
            ['Dell OptiPlex 7020 Tower', 'desktop', 'Dell', 899.00, 999.00, 18,
                'Business tower with Intel Core i7-14700, 16GB DDR5, 512GB NVMe SSD, Intel UHD 770. 3-year onsite warranty.', $desktopShots[0]],
            ['Apple Mac mini (M2)', 'desktop', 'Apple', 599.00, null, 22,
                'M2 chip, 8-core CPU, 10-core GPU, 8GB unified memory, 256GB SSD. Two Thunderbolt 4 ports, Ethernet.', $desktopShots[2]],
            ['HP Z2 Mini G9 Workstation', 'desktop', 'HP', 1899.00, 2199.00, 5,
                'Tiny ISV-certified workstation. Intel Core i7, 32GB ECC RAM, NVIDIA T1000 8GB, dual M.2 slots.', $desktopShots[1]],

            // Monitors
            ['Dell UltraSharp U2723QE 27"', 'monitor', 'Dell', 549.00, 649.00, 16,
                '27" 4K IPS Black panel, 98% DCI-P3, USB-C 90W power delivery, KVM switch, daisy-chain DisplayPort.', $monitorShots[0]],
            ['Samsung ViewFinity S9 5K', 'monitor', 'Samsung', 1199.00, 1599.00, 4,
                '27" 5K (5120x2880) IPS panel, 99% DCI-P3, factory-calibrated for creative pros.', $monitorShots[1]],
            ['HP E27u G5 USB-C Hub Monitor', 'monitor', 'HP', 419.00, null, 11,
                '27" QHD IPS, 99% sRGB, integrated USB-C hub with 100W power delivery, four-side micro-edge.', $monitorShots[2]],

            // Tablets
            ['Apple iPad Pro 13" (M4)', 'tablet', 'Apple', 1299.00, null, 13,
                'Ultra Retina XDR display, M4 chip, 256GB storage, supports Apple Pencil Pro and Magic Keyboard.', $tabletShots[0]],
            ['Samsung Galaxy Tab S9 FE+', 'tablet', 'Samsung', 599.00, 699.00, 17,
                '12.4" LCD, IP68 rated, S Pen included, 8GB RAM, 128GB storage with microSD expansion.', $tabletShots[1]],

            // Printers
            ['HP LaserJet Pro 4001dn', 'printer', 'HP', 329.00, 379.00, 25,
                'Mono laser printer, 42 ppm, automatic duplex, Ethernet, recommended 750-4000 pages/month.', $printerShots[0]],
            ['Samsung Xpress M2070FW', 'printer', 'Samsung', 199.00, null, 8,
                'Compact multifunction laser printer with Wi-Fi, scan, copy, fax. Up to 21 ppm.', $printerShots[1]],

            // Scanners
            ['HP ScanJet Pro 3000 s4', 'scanner', 'HP', 549.00, 599.00, 6,
                'Sheet-fed document scanner, 40 ppm, 80 ipm duplex, 60-page automatic document feeder.', $scannerShots[0]],
            ['Dell Smart Card Reader Scanner', 'scanner', 'Dell', 89.00, null, 30,
                'Compact USB scanner for documents and ID cards. TWAIN-compatible, Windows + macOS.', $scannerShots[1]],
        ];

        foreach ($items as [$name, $category, $brand, $price, $mrp, $stock, $desc, $sourceUrl]) {
            $slug = Str::slug($name);
            $product = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => $desc,
                    'price' => $price,
                    'mrp' => $mrp,
                    'stock' => $stock,
                    'category' => $category,
                    'brand' => $brand,
                    'shipping' => true,
                    'sku' => strtoupper(Str::random(8)),
                ]
            );

            // Each product gets the same HD image delivered through Cloudinary
            // (auto WebP/AVIF + CDN caching). Replace per product via /admin
            // when you have brand-specific photos.
            $cdnUrl = $this->cloudinaryFetch($sourceUrl);

            if ($product->images()->count() === 0) {
                Image::create(['product_id' => $product->id, 'image' => $cdnUrl]);
            }
            if (!$product->thumbnail) {
                Thumbnail::create(['product_id' => $product->id, 'thumbnail' => $cdnUrl]);
            }
        }
    }
}
