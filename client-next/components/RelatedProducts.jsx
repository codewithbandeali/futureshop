'use client'
import { useSelector } from 'react-redux'
import ProductCard from './ProductCard'

const RelatedProducts = ({ product }) => {
    const products = useSelector(state => state.product.list)

    const related = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4)

    if (related.length === 0) return null

    return (
        <section className="my-20">
            <header className="mb-8">
                <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-text-3)] mb-2">
                    More from {product.category}
                </p>
                <h2 className="text-2xl">You may also like</h2>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </section>
    )
}

export default RelatedProducts
