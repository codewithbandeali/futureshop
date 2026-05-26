import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fetchProduct, fetchProducts } from '@/lib/fetchProduct'

describe('fetchProduct', () => {
    beforeEach(() => {
        global.fetch = vi.fn()
    })
    afterEach(() => { vi.restoreAllMocks() })

    it('unwraps the Laravel API Resource envelope', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { id: 1, name: 'MacBook Air' } }),
        })

        const product = await fetchProduct(1)
        expect(product.name).toBe('MacBook Air')
    })

    it('returns null on 404 instead of throwing', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })
        const product = await fetchProduct(999)
        expect(product).toBeNull()
    })

    it('returns null on network error instead of crashing the page', async () => {
        global.fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))
        const product = await fetchProduct(1)
        expect(product).toBeNull()
    })

    it('list returns an array even on error', async () => {
        global.fetch.mockRejectedValueOnce(new Error('fail'))
        const list = await fetchProducts()
        expect(Array.isArray(list)).toBe(true)
        expect(list).toHaveLength(0)
    })
})
