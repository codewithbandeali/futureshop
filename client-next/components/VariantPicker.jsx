'use client'

/**
 * VariantPicker — chip-style option selectors for products that carry a
 * non-empty `options` map.
 *
 * Shape of `options`:
 *   { storage: ["256GB", "512GB", "1TB"], color: ["Silver", "Midnight"] }
 *
 * Reports current selections via `onChange({ storage: "512GB", color: "Silver" })`.
 * Defaults to the first value of each key on mount. Selections are purely UI
 * state today; the cart line records them as metadata for display, and the
 * checkout endpoint passes them through to order_items.selected_options when
 * the schema for per-variant inventory lands.
 */
const VariantPicker = ({ options, selected, onChange }) => {
    if (!options || typeof options !== 'object') return null
    const keys = Object.keys(options).filter(k => Array.isArray(options[k]) && options[k].length > 0)
    if (keys.length === 0) return null

    const handlePick = (key, value) => {
        onChange?.({ ...selected, [key]: value })
    }

    return (
        <div className="space-y-5 mt-7">
            {keys.map(key => {
                const values = options[key]
                const active = selected?.[key]
                const label = key.charAt(0).toUpperCase() + key.slice(1)
                return (
                    <fieldset key={key}>
                        <legend className="text-sm font-medium text-[color:var(--color-text-1)] mb-2">
                            {label}
                            {active && (
                                <span className="font-normal text-[color:var(--color-text-2)] ml-2">
                                    · {active}
                                </span>
                            )}
                        </legend>
                        <div className="flex flex-wrap gap-2">
                            {values.map(v => {
                                const isActive = v === active
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => handlePick(key, v)}
                                        aria-pressed={isActive}
                                        className={`px-4 py-2 text-sm rounded-md border transition ${
                                            isActive
                                                ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white'
                                                : 'border-[color:var(--color-border)] bg-white text-[color:var(--color-text-1)] hover:border-[color:var(--color-text-3)]'
                                        }`}
                                    >
                                        {v}
                                    </button>
                                )
                            })}
                        </div>
                    </fieldset>
                )
            })}
        </div>
    )
}

/**
 * Helper: derive default selection (first value of each option key).
 * Returns null when there are no options.
 */
export function defaultVariantSelection(options) {
    if (!options || typeof options !== 'object') return null
    const result = {}
    let any = false
    for (const [k, v] of Object.entries(options)) {
        if (Array.isArray(v) && v.length > 0) {
            result[k] = v[0]
            any = true
        }
    }
    return any ? result : null
}

export default VariantPicker
