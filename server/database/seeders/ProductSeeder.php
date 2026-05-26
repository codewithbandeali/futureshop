<?php

namespace Database\Seeders;

use App\Models\Image;
use App\Models\Product;
use App\Models\Thumbnail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * FutureShop catalog: computer hardware.
 * Categories (from client/src/utils/constants.js):
 *   desktop, laptop, printer, scanner, tablet, monitor
 * Brands: Apple, Dell, HP, Samsung
 *
 * Image strategy: each product gets a descriptive on-brand placeholder so
 * the storefront renders correctly with zero external assets. Real product
 * photos should be uploaded through /admin/products/[id]/edit once the
 * admin is live; the upload goes through Cloudinary and replaces the
 * placeholder URL on the matching row.
 */
class ProductSeeder extends Seeder
{
    public function run()
    {
        // [name, category, brand, price, mrp(null=no sale), stock, description]
        $items = [
            // Laptops
            ['Dell XPS 13 (2024)', 'laptop', 'Dell', 1399.00, 1599.00, 14,
                '13.4" InfinityEdge display, Intel Core Ultra 7, 16GB LPDDR5x, 512GB NVMe SSD. Built for mobile productivity with 12-hour battery.'],
            ['HP EliteBook 845 G11', 'laptop', 'HP', 1599.00, 1799.00, 9,
                '14" business laptop with AMD Ryzen 7 Pro, 32GB DDR5, 1TB SSD, vPro security, fingerprint reader.'],
            ['Apple MacBook Air 15"', 'laptop', 'Apple', 1499.00, null, 12,
                'M3 chip, 8-core CPU, 10-core GPU, 16GB unified memory, 512GB SSD. 18-hour battery, silent fanless design.'],
            ['Samsung Galaxy Book4 Pro', 'laptop', 'Samsung', 1349.00, 1499.00, 7,
                '16" 3K AMOLED, Intel Core Ultra 7, 16GB LPDDR5x, 1TB SSD. Co-pilot+ PC certified.'],

            // Desktops
            ['Dell OptiPlex 7020 Tower', 'desktop', 'Dell', 899.00, 999.00, 18,
                'Business tower with Intel Core i7-14700, 16GB DDR5, 512GB NVMe SSD, Intel UHD 770. 3-year onsite warranty.'],
            ['Apple Mac mini (M2)', 'desktop', 'Apple', 599.00, null, 22,
                'M2 chip, 8-core CPU, 10-core GPU, 8GB unified memory, 256GB SSD. Two Thunderbolt 4 ports, Ethernet.'],
            ['HP Z2 Mini G9 Workstation', 'desktop', 'HP', 1899.00, 2199.00, 5,
                'Tiny ISV-certified workstation. Intel Core i7, 32GB ECC RAM, NVIDIA T1000 8GB, dual M.2 slots.'],

            // Monitors
            ['Dell UltraSharp U2723QE 27"', 'monitor', 'Dell', 549.00, 649.00, 16,
                '27" 4K IPS Black panel, 98% DCI-P3, USB-C 90W power delivery, KVM switch, daisy-chain DisplayPort.'],
            ['Samsung ViewFinity S9 5K', 'monitor', 'Samsung', 1199.00, 1599.00, 4,
                '27" 5K (5120x2880) IPS panel, 99% DCI-P3, factory-calibrated for creative pros.'],
            ['HP E27u G5 USB-C Hub Monitor', 'monitor', 'HP', 419.00, null, 11,
                '27" QHD IPS, 99% sRGB, integrated USB-C hub with 100W power delivery, four-side micro-edge.'],

            // Tablets
            ['Apple iPad Pro 13" (M4)', 'tablet', 'Apple', 1299.00, null, 13,
                'Ultra Retina XDR display, M4 chip, 256GB storage, supports Apple Pencil Pro and Magic Keyboard.'],
            ['Samsung Galaxy Tab S9 FE+', 'tablet', 'Samsung', 599.00, 699.00, 17,
                '12.4" LCD, IP68 rated, S Pen included, 8GB RAM, 128GB storage with microSD expansion.'],

            // Printers
            ['HP LaserJet Pro 4001dn', 'printer', 'HP', 329.00, 379.00, 25,
                'Mono laser printer, 42 ppm, automatic duplex, Ethernet, recommended 750-4000 pages/month.'],
            ['Samsung Xpress M2070FW', 'printer', 'Samsung', 199.00, null, 8,
                'Compact multifunction laser printer with Wi-Fi, scan, copy, fax. Up to 21 ppm.'],

            // Scanners
            ['HP ScanJet Pro 3000 s4', 'scanner', 'HP', 549.00, 599.00, 6,
                'Sheet-fed document scanner, 40 ppm, 80 ipm duplex, 60-page automatic document feeder.'],
            ['Dell Smart Card Reader Scanner', 'scanner', 'Dell', 89.00, null, 30,
                'Compact USB scanner for documents and ID cards. TWAIN-compatible, Windows + macOS.'],
        ];

        foreach ($items as [$name, $category, $brand, $price, $mrp, $stock, $desc]) {
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

            // Each product gets a unique branded placeholder image labeled with the product
            // name. The shop palette (#1a1a2e brand on warm off-white) is preserved.
            $placeholder = 'https://placehold.co/800x800/1a1a2e/f8f7f4?text=' . rawurlencode($name);

            if ($product->images()->count() === 0) {
                Image::create(['product_id' => $product->id, 'image' => $placeholder]);
            }
            if (!$product->thumbnail) {
                Thumbnail::create(['product_id' => $product->id, 'thumbnail' => $placeholder]);
            }
        }
    }
}
