/**
 * Wishlist — localStorage-backed, no server round-trip yet.
 *
 * Stores product IDs only (not snapshots) so the displayed price/title
 * always matches the live catalog. The component re-resolves IDs against
 * the Redux product list at render time.
 *
 * When server-side wishlists become a requirement, swap the read/write
 * functions for /api/wishlist calls — the public API of this module
 * (toggleWishlist, isWished, getWishlistIds) stays the same.
 */
const KEY = 'futureshop_wishlist_v1'
const EVT = 'futureshop:wishlist'

function safeRead() {
    if (typeof window === 'undefined') return []
    try {
        const raw = window.localStorage.getItem(KEY)
        const arr = raw ? JSON.parse(raw) : []
        return Array.isArray(arr) ? arr : []
    } catch {
        return []
    }
}

function safeWrite(arr) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(KEY, JSON.stringify(arr))
        // Notify other components in the same tab; storage event covers
        // cross-tab automatically.
        window.dispatchEvent(new CustomEvent(EVT))
    } catch {
        // Quota / private mode — fail silently
    }
}

export function getWishlistIds() {
    return safeRead().map(String)
}

export function isWished(productId) {
    if (productId == null) return false
    return safeRead().some(x => String(x) === String(productId))
}

export function addToWishlist(productId) {
    if (productId == null) return
    const id = String(productId)
    const current = safeRead().map(String).filter(x => x !== id)
    current.unshift(id)
    safeWrite(current)
}

export function removeFromWishlist(productId) {
    if (productId == null) return
    const id = String(productId)
    safeWrite(safeRead().map(String).filter(x => x !== id))
}

/** Returns the new state: true = is now wished, false = was removed. */
export function toggleWishlist(productId) {
    if (isWished(productId)) {
        removeFromWishlist(productId)
        return false
    }
    addToWishlist(productId)
    return true
}

export const WISHLIST_EVENT = EVT
