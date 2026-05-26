import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Wipe DOM after each test so they're isolated.
afterEach(() => cleanup())

// Next.js navigation hooks aren't available in jsdom — stub them.
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
    notFound: vi.fn(),
}))

// next/image: render a plain <img>
vi.mock('next/image', () => ({
    default: (props) => {
        const { src, alt = '', ...rest } = props
        return <img src={typeof src === 'string' ? src : src?.src} alt={alt} {...rest} />
    },
}))
