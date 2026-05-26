<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'mrp',
        'stock',
        'category',
        'brand',
        'shipping',
        'sku',
        'colors'
    ];

    protected $casts = [
        'shipping' => 'boolean',
        'price' => 'decimal:2',
        'mrp' => 'decimal:2',
    ];


    public function images(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Image::class);
    }

    public function thumbnail(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Thumbnail::class);
    }

    public function ratings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function getInStockAttribute(): bool
    {
        return (int) $this->stock > 0;
    }
}
