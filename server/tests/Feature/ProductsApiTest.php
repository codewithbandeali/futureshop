<?php

namespace Tests\Feature;

use App\Models\Image;
use App\Models\Product;
use App\Models\Thumbnail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_product_index_returns_collection(): void
    {
        $product = Product::create([
            'name' => 'Test Laptop',
            'slug' => 'test-laptop',
            'description' => 'Test description',
            'price' => 999.00,
            'mrp' => 1199.00,
            'stock' => 5,
            'category' => 'laptop',
            'brand' => 'Dell',
            'shipping' => true,
            'sku' => 'TL-001',
        ]);
        Thumbnail::create(['product_id' => $product->id, 'thumbnail' => 'https://example.com/thumb.jpg']);
        Image::create(['product_id' => $product->id, 'image' => 'https://example.com/img.jpg']);

        $response = $this->getJson('/api/products');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'price', 'mrp', 'inStock', 'images', 'rating']]]);

        // The API Resource should convert stock>0 to inStock=true
        $this->assertTrue($response->json('data.0.inStock'));
    }

    public function test_product_show_returns_single_product(): void
    {
        $product = Product::create([
            'name' => 'MacBook Air',
            'slug' => 'macbook-air',
            'description' => 'Apple laptop',
            'price' => 1499,
            'stock' => 3,
            'category' => 'laptop',
            'brand' => 'Apple',
            'shipping' => true,
            'sku' => 'MBA-001',
        ]);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertOk()
            ->assertJsonPath('data.name', 'MacBook Air')
            ->assertJsonPath('data.brand', 'Apple');
    }

    public function test_product_show_returns_404_for_missing(): void
    {
        $this->getJson('/api/products/99999')->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_delete_product(): void
    {
        $product = Product::create([
            'name' => 'Test', 'slug' => 'test', 'description' => 'x',
            'price' => 10, 'stock' => 1, 'category' => 'laptop',
            'brand' => 'Dell', 'shipping' => true, 'sku' => 'T-1',
        ]);

        $this->deleteJson("/api/products/{$product->id}")->assertUnauthorized();
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_authenticated_non_admin_cannot_delete_product(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $product = Product::create([
            'name' => 'Test', 'slug' => 'test', 'description' => 'x',
            'price' => 10, 'stock' => 1, 'category' => 'laptop',
            'brand' => 'Dell', 'shipping' => true, 'sku' => 'T-1',
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/products/{$product->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_admin_can_delete_product(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $product = Product::create([
            'name' => 'Test', 'slug' => 'test', 'description' => 'x',
            'price' => 10, 'stock' => 1, 'category' => 'laptop',
            'brand' => 'Dell', 'shipping' => true, 'sku' => 'T-1',
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/products/{$product->id}")
            ->assertOk();

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
