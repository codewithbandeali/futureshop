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
 * Unsplash photo (commercial-use, no attribution required) served via
 * Unsplash's own CDN. Resolution 1200px, q=85 — production-grade.
 *
 * To move these to permanent Cloudinary-hosted assets, run after seeding:
 *   php artisan products:upload-images-to-cloudinary
 *
 * Variant strategy: products that genuinely have configurations (laptops,
 * tablets) get a JSON `options` map; everything else stores null. See the
 * `add_options_to_products_table` migration for the schema contract.
 */
class ProductSeeder extends Seeder
{
    public function run()
    {
        // Curated HD Unsplash photos — 1200px, JPEG q=85. Each product gets
        // its own 3-photo gallery so no two products on the listing grid
        // share their main shot, and scanners don't reuse printer photos.
        $u = fn(string $id) => "https://images.unsplash.com/photo-{$id}?w=1200&q=85";

        $L1 = $u('1496181133206-80ce9b88a853'); // silver laptop on desk
        $L2 = $u('1517336714731-489689fd1ca8'); // laptop, side angle
        $L3 = $u('1525547719571-a2d4ac8945e2'); // laptop with code
        $L4 = $u('1531297484001-80022131f5a1'); // laptop with peripherals
        $D1 = $u('1587202372775-e229f172b9d7'); // tower workstation
        $D2 = $u('1593642632559-0c6d3fc62b89'); // mini desktop on desk
        $D3 = $u('1547082299-de196ea013d6');    // tech setup with mini PC
        $M1 = $u('1547119957-637f8679db1e');    // monitor with code
        $M2 = $u('1527443224154-c4a3942d3acf'); // monitor on desk
        $M3 = $u('1616763355548-1b606f439f86'); // ultrawide monitor
        $T1 = $u('1561154464-82e9adf32764');    // tablet with stylus
        $T2 = $u('1542751110-97427bbecf20');    // tablet on table
        $T3 = $u('1516321318423-f06f85e504b3'); // tablet keyboard
        $P1 = $u('1612815154858-60aa4c59eaa6'); // laser printer
        $P2 = $u('1586953208448-b95a79798f07'); // office printer
        $P3 = $u('1562408590-e32931084e23');    // multifunction printer
        $S1 = $u('1581092795360-fd1ca04f0952'); // small USB peripheral
        $S2 = $u('1581090700227-1e37b190418e'); // tech accessories

        // Variant option presets — only populated for products where the
        // shopper genuinely picks a configuration.
        $macbookOptions = [
            'storage' => ['256GB', '512GB', '1TB', '2TB'],
            'color'   => ['Midnight', 'Silver', 'Starlight', 'Space Gray'],
        ];
        $xpsOptions = [
            'memory'  => ['16GB', '32GB'],
            'storage' => ['512GB', '1TB', '2TB'],
            'color'   => ['Platinum', 'Graphite'],
        ];
        $ipadOptions = [
            'storage'      => ['256GB', '512GB', '1TB', '2TB'],
            'color'        => ['Space Black', 'Silver'],
            'connectivity' => ['Wi-Fi', 'Wi-Fi + Cellular'],
        ];
        $galaxyTabOptions = [
            'storage' => ['128GB', '256GB'],
            'color'   => ['Mint', 'Silver', 'Gray', 'Lavender'],
        ];

        // Per-slug galleries: main + 2 alternate angles, all distinct.
        // No product reuses another product's main photo within the same
        // category, and scanners don't share photos with printers.
        $galleries = [
            'dell-xps-13-2024'                => [$L1, $L2, $L3],
            'hp-elitebook-845-g11'            => [$L2, $L4, $L1],
            'apple-macbook-air-15'            => [$L3, $L1, $L4],
            'samsung-galaxy-book4-pro'        => [$L4, $L3, $L2],
            'dell-optiplex-7020-tower'        => [$D1, $D3, $D2],
            'apple-mac-mini-m2'               => [$D2, $D1, $D3],
            'hp-z2-mini-g9-workstation'       => [$D3, $D2, $D1],
            'dell-ultrasharp-u2723qe-27'      => [$M1, $M2, $M3],
            'samsung-viewfinity-s9-5k'        => [$M2, $M3, $M1],
            'hp-e27u-g5-usb-c-hub-monitor'    => [$M3, $M1, $M2],
            'apple-ipad-pro-13-m4'            => [$T1, $T3, $T2],
            'samsung-galaxy-tab-s9-fe'        => [$T2, $T1, $T3],
            'hp-laserjet-pro-4001dn'          => [$P1, $P3, $P2],
            'samsung-xpress-m2070fw'          => [$P3, $P2, $P1],
            'hp-scanjet-pro-3000-s4'          => [$S2, $S1, $M3],
            'dell-smart-card-reader-scanner'  => [$S1, $S2, $D2],
        ];

        // [name, category, brand, price, mrp(null=no sale), stock, description, options(null=no variants)]
        $items = [
            // Laptops
            ['Dell XPS 13 (2024)', 'laptop', 'Dell', 1399.00, 1599.00, 14,
                '13.4" InfinityEdge display, Intel Core Ultra 7, 16GB LPDDR5x, 512GB NVMe SSD. Built for mobile productivity with 12-hour battery.', $xpsOptions],
            ['HP EliteBook 845 G11', 'laptop', 'HP', 1599.00, 1799.00, 9,
                '14" business laptop with AMD Ryzen 7 Pro, 32GB DDR5, 1TB SSD, vPro security, fingerprint reader.', null],
            ['Apple MacBook Air 15"', 'laptop', 'Apple', 1499.00, null, 12,
                'M3 chip, 8-core CPU, 10-core GPU, 16GB unified memory, 512GB SSD. 18-hour battery, silent fanless design.', $macbookOptions],
            ['Samsung Galaxy Book4 Pro', 'laptop', 'Samsung', 1349.00, 1499.00, 7,
                '16" 3K AMOLED, Intel Core Ultra 7, 16GB LPDDR5x, 1TB SSD. Co-pilot+ PC certified.', null],

            // Desktops
            ['Dell OptiPlex 7020 Tower', 'desktop', 'Dell', 899.00, 999.00, 18,
                'Business tower with Intel Core i7-14700, 16GB DDR5, 512GB NVMe SSD, Intel UHD 770. 3-year onsite warranty.', null],
            ['Apple Mac mini (M2)', 'desktop', 'Apple', 599.00, null, 22,
                'M2 chip, 8-core CPU, 10-core GPU, 8GB unified memory, 256GB SSD. Two Thunderbolt 4 ports, Ethernet.', null],
            ['HP Z2 Mini G9 Workstation', 'desktop', 'HP', 1899.00, 2199.00, 5,
                'Tiny ISV-certified workstation. Intel Core i7, 32GB ECC RAM, NVIDIA T1000 8GB, dual M.2 slots.', null],

            // Monitors
            ['Dell UltraSharp U2723QE 27"', 'monitor', 'Dell', 549.00, 649.00, 16,
                '27" 4K IPS Black panel, 98% DCI-P3, USB-C 90W power delivery, KVM switch, daisy-chain DisplayPort.', null],
            ['Samsung ViewFinity S9 5K', 'monitor', 'Samsung', 1199.00, 1599.00, 4,
                '27" 5K (5120x2880) IPS panel, 99% DCI-P3, factory-calibrated for creative pros.', null],
            ['HP E27u G5 USB-C Hub Monitor', 'monitor', 'HP', 419.00, null, 11,
                '27" QHD IPS, 99% sRGB, integrated USB-C hub with 100W power delivery, four-side micro-edge.', null],

            // Tablets
            ['Apple iPad Pro 13" (M4)', 'tablet', 'Apple', 1299.00, null, 13,
                'Ultra Retina XDR display, M4 chip, 256GB storage, supports Apple Pencil Pro and Magic Keyboard.', $ipadOptions],
            ['Samsung Galaxy Tab S9 FE+', 'tablet', 'Samsung', 599.00, 699.00, 17,
                '12.4" LCD, IP68 rated, S Pen included, 8GB RAM, 128GB storage with microSD expansion.', $galaxyTabOptions],

            // Printers
            ['HP LaserJet Pro 4001dn', 'printer', 'HP', 329.00, 379.00, 25,
                'Mono laser printer, 42 ppm, automatic duplex, Ethernet, recommended 750-4000 pages/month.', null],
            ['Samsung Xpress M2070FW', 'printer', 'Samsung', 199.00, null, 8,
                'Compact multifunction laser printer with Wi-Fi, scan, copy, fax. Up to 21 ppm.', null],

            // Scanners
            ['HP ScanJet Pro 3000 s4', 'scanner', 'HP', 549.00, 599.00, 6,
                'Sheet-fed document scanner, 40 ppm, 80 ipm duplex, 60-page automatic document feeder.', null],
            ['Dell Smart Card Reader Scanner', 'scanner', 'Dell', 89.00, null, 30,
                'Compact USB scanner for documents and ID cards. TWAIN-compatible, Windows + macOS.', null],
        ];

        // Demo media — populated by slug. Real catalog content is added by
        // the shop owner via /admin/products/[id]/edit.
        //
        // Apple's "Get to know MacBook Air" demo video is a public
        // YouTube embed; using it as the seeded value gives a working
        // "Video" tab on the MacBook Air PDP out-of-the-box. Swap for
        // any URL in the admin form.
        $videoBySlug = [
            'apple-macbook-air-15' => 'https://www.youtube.com/watch?v=hjE_TsHhMP4',
        ];

        // 360° frames: the seeder doesn't have a real spin set, so we
        // pre-populate one product (Apple Mac mini) with its own gallery
        // as a "preview" — the spinner widget will render and the drag
        // interaction will work, demonstrating the feature end-to-end. The
        // shop owner replaces this with a real 24-72 frame sequence via
        // the admin form.
        $view360BySlug = [
            'apple-mac-mini-m2' => $galleries['apple-mac-mini-m2'],
        ];

        foreach ($items as [$name, $category, $brand, $price, $mrp, $stock, $desc, $options]) {
            $slug = Str::slug($name);
            $gallery = $galleries[$slug] ?? [];
            $main = $gallery[0] ?? null;

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
                    'options' => $options,
                    'video_url' => $videoBySlug[$slug] ?? null,
                    'view_360_urls' => $view360BySlug[$slug] ?? null,
                ]
            );

            // Keep existing seeded products in sync when the gallery changes.
            // This makes `php artisan db:seed --class=ProductSeeder` enough to
            // upgrade old 1-image rows to the current 3-image PDP gallery.
            $product->images()->delete();
            foreach ($gallery as $url) {
                Image::create(['product_id' => $product->id, 'image' => $url]);
            }
            if ($main) {
                Thumbnail::updateOrCreate(
                    ['product_id' => $product->id],
                    ['thumbnail' => $main]
                );
            }
        }
    }
}
