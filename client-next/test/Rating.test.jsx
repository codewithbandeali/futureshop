import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Rating from '@/components/Rating'

describe('Rating', () => {
    it('renders 5 stars regardless of value', () => {
        const { container } = render(<Rating value={3} />)
        const stars = container.querySelectorAll('svg')
        expect(stars.length).toBe(5)
    })

    it('exposes the rating to screen readers', () => {
        render(<Rating value={4} />)
        expect(screen.getByLabelText('Rated 4 out of 5')).toBeInTheDocument()
    })

    it('handles a zero rating without errors', () => {
        render(<Rating value={0} />)
        expect(screen.getByLabelText('Rated 0 out of 5')).toBeInTheDocument()
    })
})
