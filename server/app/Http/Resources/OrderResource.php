<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'subtotal' => (float) $this->subtotal,
            'shipping' => (float) $this->shipping,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'currency' => $this->currency,
            'payment_status' => $this->payment_status,
            'address' => $this->whenLoaded('address'),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn($i) => [
                    'id' => $i->id,
                    'product_id' => $i->product_id,
                    'product_name' => $i->product_name,
                    'product_sku' => $i->product_sku,
                    'quantity' => (int) $i->quantity,
                    'unit_price' => (float) $i->unit_price,
                    'line_total' => (float) $i->line_total,
                ])->values();
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
