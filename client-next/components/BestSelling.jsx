'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const DISPLAY = 8

const BestSelling = () => {
    const products = useSelector(state => state.product.list)

    const sorted = products
        .slice()
        .sort((a, b) => (b.rating?.length ?? 0) - (a.rating?.length ?? 0))
        .slice(0, DISPLAY)

    if (sorted.length === 0) return null

    return (
        <section className="px-6 my-24 max-w-7xl mx-auto">
            <Title
                title="Best sellers"
                description={`Showing ${sorted.length} of ${products.length} products`}
                href="/shop"
            />
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {sorted.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </section>
    )
}

export default BestSelling
