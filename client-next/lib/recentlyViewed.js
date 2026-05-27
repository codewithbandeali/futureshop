/**
 * Recently-viewed tracking — localStorage-backed.
 *
 * We store only the product ID, not a snapshot of the product, so renames
 * or price changes are reflected the next time the user sees the chip.
 * The list is capped at MAX_ITEMS and de-duped on add (touching an entry
 * moves it to the front).
 */
const KEY = 'futureshop_recently_viewed_v1'
const MAX_ITEMS = 12

function safeRead() {
    if (typeof window === 'undefined') return []
    try {
        const raw = window.localStorage.getItem(KEY)
        if (!raw) return []
        const arr = JSON.parse(raw)
        return Array.isArray(arr) ? arr : []
    } catch {
        return []
    }
}

function safeWrite(arr) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX_ITEMS)))
    } catch {
        // Quota exceeded / private browsing — silently skip
    }
}

export function recordRecentlyViewed(productId) {
    if (!productId) return
    const id = String(productId)
    const current = safeRead().filter(x => String(x) !== id)
    current.unshift(id)
    safeWrite(current)
}

export function getRecentlyViewedIds(excludeId = null) {
    const list = safeRead()
    if (!excludeId) return list
    const ex = String(excludeId)
    return list.filter(x => String(x) !== ex)
}

export function clearRecentlyViewed() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(KEY)
}
