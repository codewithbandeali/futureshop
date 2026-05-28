'use client'

import Image from 'next/image'

/**
 * Renders ordered A+ content blocks from product.aplus_blocks.
 * Each block has a `type` discriminator; unknown types are skipped
 * so older data stays compatible if the schema evolves.
 *
 * See the AddAplusBlocksToProductsTable migration for the contract.
 */
const APlusContent = ({ blocks = [] }) => {
    if (!Array.isArray(blocks) || blocks.length === 0) return null

    return (
        <div className="space-y-12 mt-8">
            {blocks.map((block, i) => {
                if (!block || typeof block !== 'object') return null
                const key = `${block.type ?? 'block'}-${i}`
                switch (block.type) {
                    case 'hero':
                        return <Hero key={key} block={block} />
                    case 'feature':
                        return <Feature key={key} block={block} reverse={i % 2 === 1} />
                    case 'callout':
                        return <Callout key={key} block={block} />
                    case 'image':
                        return <ImageBlock key={key} block={block} />
                    default:
                        return null
                }
            })}
        </div>
    )
}

function Hero({ block }) {
    return (
        <section className="relative w-full bg-[color:var(--color-brand)] text-white rounded-2xl overflow-hidden">
            {block.image && (
                <div className="relative w-full h-[280px] sm:h-[360px]">
                    <Image
                        src={block.image}
                        alt=""
                        fill
                        sizes="(min-width:1024px) 800px, 100vw"
                        className="object-cover opacity-50"
                    />
                </div>
            )}
            <div className={`p-8 sm:p-12 ${block.image ? 'absolute inset-0 flex flex-col justify-end' : ''}`}>
                {block.heading && (
                    <h3 className="text-3xl sm:text-4xl text-white">{block.heading}</h3>
                )}
                {block.body && (
                    <p className="max-w-xl mt-3 text-white/85">{block.body}</p>
                )}
            </div>
        </section>
    )
}

function Feature({ block, reverse }) {
    return (
        <section className={`flex max-md:flex-col gap-8 items-center ${reverse ? 'md:flex-row-reverse' : ''}`}>
            {block.image && (
                <div className="relative w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-[color:var(--color-surface-2)]">
                    <Image
                        src={block.image}
                        alt=""
                        fill
                        sizes="(min-width:768px) 400px, 100vw"
                        className="object-cover"
                    />
                </div>
            )}
            <div className="w-full md:w-1/2">
                {block.heading && (
                    <h3 className="text-2xl text-[color:var(--color-text-1)]">{block.heading}</h3>
                )}
                {block.body && (
                    <p className="text-[color:var(--color-text-2)] leading-7 mt-3">{block.body}</p>
                )}
            </div>
        </section>
    )
}

function Callout({ block }) {
    return (
        <section className="bg-[color:var(--color-surface-2)] rounded-2xl p-8 text-center">
            {block.heading && (
                <h3 className="text-2xl text-[color:var(--color-text-1)]">{block.heading}</h3>
            )}
            {block.body && (
                <p className="text-[color:var(--color-text-2)] mt-3 max-w-xl mx-auto">{block.body}</p>
            )}
        </section>
    )
}

function ImageBlock({ block }) {
    if (!block.image) return null
    return (
        <figure>
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[color:var(--color-surface-2)]">
                <Image
                    src={block.image}
                    alt={block.caption || ''}
                    fill
                    sizes="(min-width:1024px) 800px, 100vw"
                    className="object-cover"
                />
            </div>
            {block.caption && (
                <figcaption className="text-xs text-[color:var(--color-text-3)] mt-2 text-center">
                    {block.caption}
                </figcaption>
            )}
        </figure>
    )
}

export default APlusContent
