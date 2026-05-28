<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'min_subtotal',
        'usage_limit',
        'usage_count',
        'first_order_only',
        'is_public',
        'active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_subtotal' => 'decimal:2',
        'first_order_only' => 'boolean',
        'is_public' => 'boolean',
        'active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /** True if the coupon is within its date window AND under its usage cap. */
    public function isCurrentlyRedeemable(): bool
    {
        if (! $this->active) return false;
        $now = now();
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->usage_limit !== null && $this->usage_count >= $this->usage_limit) return false;
        return true;
    }

    /**
     * Compute the discount on a given subtotal. Returns 0 if the coupon
     * doesn't apply (sub-min, fixed > subtotal, etc).
     */
    public function discountFor(float $subtotal): float
    {
        if ($this->min_subtotal !== null && $subtotal < (float) $this->min_subtotal) {
            return 0.0;
        }
        if ($this->discount_type === 'percent') {
            return round($subtotal * ((float) $this->discount_value) / 100, 2);
        }
        return min((float) $this->discount_value, $subtotal);
    }
}
