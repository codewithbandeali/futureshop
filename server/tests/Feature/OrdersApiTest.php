<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrdersApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_creation_decrements_stock_atomically(): void
    {
        $user = User::factory()->create();
        $address = Address::create([
            'user_id' => $user->id,
            'full_name' => 'Test User',
            'phone' => '555-1234',
            'line1' => '1 Test St',
            'city' => 'Anywhere',
            'postal_code' => '12345',
            'country' => 'US',
        ]);
        $product = Product::create([
            'name' => 'Test Monitor', 'slug' => 'test-monitor', 'description' => 'x',
            'price' => 100, 'stock' => 5, 'category' => 'monitor',
            'brand' => 'Dell', 'shipping' => true, 'sku' => 'M-1',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
            'address_id' => $address->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'currency' => 'USD',
        ]);

        $response->assertCreated();

        // Stock decremented from 5 to 3
        $this->assertEquals(3, $product->fresh()->stock);

        // Order persisted with line items
        $order = Order::with('items')->first();
        $this->assertNotNull($order);
        $this->assertEquals(200.00, (float) $order->subtotal);
        $this->assertCount(1, $order->items);
    }

    public function test_order_creation_rejects_insufficient_stock(): void
    {
        $user = User::factory()->create();
        $address = Address::create([
            'user_id' => $user->id,
            'full_name' => 'Test',
            'phone' => '555-1234',
            'line1' => '1 Test St',
            'city' => 'Anywhere',
            'postal_code' => '12345',
            'country' => 'US',
        ]);
        $product = Product::create([
            'name' => 'Test', 'slug' => 'test-low', 'description' => 'x',
            'price' => 100, 'stock' => 1, 'category' => 'laptop',
            'brand' => 'Dell', 'shipping' => true, 'sku' => 'TL-1',
        ]);

        $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 99]],
        ])->assertStatus(422);

        // Stock unchanged on validation failure
        $this->assertEquals(1, $product->fresh()->stock);
    }

    public function test_anonymous_user_cannot_create_order(): void
    {
        $this->postJson('/api/orders', [])->assertUnauthorized();
    }

    public function test_admin_status_update_to_cancelled_restocks_items(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $address = Address::create([
            'user_id' => $user->id,
            'full_name' => 'Test',
            'phone' => '555-1234',
            'line1' => '1 Test St',
            'city' => 'Anywhere',
            'postal_code' => '12345',
            'country' => 'US',
        ]);
        $product = Product::create([
            'name' => 'Test', 'slug' => 'test-cancel', 'description' => 'x',
            'price' => 100, 'stock' => 10, 'category' => 'laptop',
            'brand' => 'Dell', 'shipping' => true, 'sku' => 'TC-1',
        ]);

        // Place order — stock goes from 10 to 7
        $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 3]],
        ])->assertCreated();
        $this->assertEquals(7, $product->fresh()->stock);

        $order = Order::first();

        // Admin cancels — stock should return to 10
        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertOk();

        $this->assertEquals(10, $product->fresh()->stock);
        $this->assertEquals('cancelled', $order->fresh()->status);
    }
}
