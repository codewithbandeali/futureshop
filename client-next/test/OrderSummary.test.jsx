import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderSummary from '@/components/OrderSummary'

// next/link is not strictly needed but we stub to avoid the App Router warning
vi.mock('next/link', () => ({
    default: ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

describe('OrderSummary', () => {
    it('shows free delivery when subtotal is over $50', () => {
        render(<OrderSummary totalPrice={75} items={[{ quantity: 1 }]} />)
        expect(screen.getByText('FREE')).toBeInTheDocument()
        // Total = subtotal (no shipping)
        expect(screen.getAllByText('$75.00').length).toBeGreaterThanOrEqual(1)
    })

    it('adds shipping when subtotal is under $50', () => {
        render(<OrderSummary totalPrice={20} items={[{ quantity: 1 }]} />)
        expect(screen.getByText('$5.99')).toBeInTheDocument()
        // Total = 20 + 5.99
        expect(screen.getByText('$25.99')).toBeInTheDocument()
    })

    it('nudges the shopper toward free shipping threshold', () => {
        render(<OrderSummary totalPrice={30} items={[{ quantity: 1 }]} />)
        expect(screen.getByText(/Spend \$20\.00 more/)).toBeInTheDocument()
    })

    it('reports item count', () => {
        render(<OrderSummary totalPrice={20} items={[{ quantity: 2 }, { quantity: 3 }]} />)
        expect(screen.getByText('5 items in cart')).toBeInTheDocument()
    })
})
