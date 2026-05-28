'use client'

import { Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * 360° product spinner.
 *
 * Driven by `frames`: an ordered array of image URLs. The widget preloads
 * them, then maps horizontal cursor/touch movement onto frame index so
 * a small drag step rotates by N frames. Supports keyboard (arrow keys),
 * touch swipe, and an autoplay toggle.
 *
 * Production usage:
 *   <Spinner360 frames={product.view_360_urls} alt={product.name} />
 *
 * The component is fully self-contained — no third-party JS, no
 * proprietary asset format. Any 360° creation tool (Orbitvu, Iconasys,
 * Sirv export, smartphone+turntable apps) outputs sequential JPEG/PNG
 * frames, which is exactly what this widget consumes.
 */
const Spinner360 = ({ frames = [], alt = '', sensitivity = 6, autoSpinIntervalMs = 90 }) => {
    const safeFrames = useMemo(
        () => (Array.isArray(frames) ? frames.filter(Boolean) : []),
        [frames]
    )
    const frameCount = safeFrames.length

    const [frameIndex, setFrameIndex] = useState(0)
    const [autoplay, setAutoplay] = useState(false)
    const [loaded, setLoaded] = useState(0)

    const containerRef = useRef(null)
    const dragRef = useRef({ active: false, startX: 0, startFrame: 0 })

    // Preload every frame so dragging is glitch-free. Skipped on SSR.
    useEffect(() => {
        if (typeof window === 'undefined') return
        let cancelled = false
        let count = 0
        safeFrames.forEach((src) => {
            const img = new window.Image()
            img.onload = img.onerror = () => {
                if (cancelled) return
                count += 1
                setLoaded(count)
            }
            img.src = src
        })
        return () => { cancelled = true }
    }, [safeFrames])

    // Autoplay loop
    useEffect(() => {
        if (!autoplay || frameCount < 2) return
        const id = setInterval(() => {
            setFrameIndex(i => (i + 1) % frameCount)
        }, autoSpinIntervalMs)
        return () => clearInterval(id)
    }, [autoplay, frameCount, autoSpinIntervalMs])

    // Keyboard nav — left/right cycles by one frame
    const onKey = useCallback((e) => {
        if (frameCount < 2) return
        if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setFrameIndex(i => (i - 1 + frameCount) % frameCount)
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            setFrameIndex(i => (i + 1) % frameCount)
        } else if (e.key === ' ') {
            e.preventDefault()
            setAutoplay(a => !a)
        }
    }, [frameCount])

    // Cursor/touch drag — map ΔX to frame steps
    const startDrag = (clientX) => {
        dragRef.current = { active: true, startX: clientX, startFrame: frameIndex }
        setAutoplay(false)
    }
    const moveDrag = useCallback((clientX) => {
        if (!dragRef.current.active || frameCount < 2) return
        const dx = clientX - dragRef.current.startX
        const stepPx = Math.max(2, sensitivity)
        const steps = Math.round(dx / stepPx)
        const next = ((dragRef.current.startFrame - steps) % frameCount + frameCount) % frameCount
        setFrameIndex(next)
    }, [frameCount, sensitivity])
    const endDrag = () => { dragRef.current.active = false }

    // Global listeners so a drag started inside the box keeps tracking
    // even if the cursor briefly leaves it.
    useEffect(() => {
        const onMouseMove = (e) => moveDrag(e.clientX)
        const onMouseUp = endDrag
        const onTouchMove = (e) => {
            if (e.touches[0]) moveDrag(e.touches[0].clientX)
        }
        const onTouchEnd = endDrag
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('touchmove', onTouchMove, { passive: true })
        window.addEventListener('touchend', onTouchEnd)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }
    }, [moveDrag])

    if (frameCount === 0) return null

    const allReady = loaded >= frameCount

    return (
        <div className="relative">
            <div
                ref={containerRef}
                role="img"
                aria-roledescription="360 degree product spinner"
                aria-label={`${alt || 'Product'} — 360° view, drag to rotate`}
                tabIndex={0}
                onKeyDown={onKey}
                onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX) }}
                onTouchStart={(e) => { if (e.touches[0]) startDrag(e.touches[0].clientX) }}
                className="relative w-full aspect-square bg-[color:var(--color-surface-2)] rounded-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-brand)]"
            >
                {/* Render every frame but only the current one is visible — this
                    avoids a flash of white between transitions because the next
                    frame has already been painted to its layer. */}
                {safeFrames.map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        key={src + i}
                        src={src}
                        alt=""
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ opacity: i === frameIndex ? 1 : 0 }}
                    />
                ))}

                {!allReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                        <div className="text-xs text-[color:var(--color-text-2)]">
                            Loading {loaded}/{frameCount} frames…
                        </div>
                    </div>
                )}

                {/* Hint pill */}
                <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <RotateCcw size={11} /> 360°
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-[color:var(--color-text-3)]">
                    Drag to rotate · {frameIndex + 1}/{frameCount}
                </p>
                <button
                    type="button"
                    onClick={() => setAutoplay(a => !a)}
                    aria-pressed={autoplay}
                    className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-text-2)] hover:text-[color:var(--color-text-1)] min-h-[36px] px-3"
                >
                    {autoplay ? <Pause size={12} /> : <Play size={12} />}
                    {autoplay ? 'Pause' : 'Auto-spin'}
                </button>
            </div>
        </div>
    )
}

export default Spinner360
