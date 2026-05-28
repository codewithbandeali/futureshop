'use client'

/**
 * Embeds a product video. Supports:
 *  - Raw HTML5 (mp4/webm) URLs → native <video> with controls
 *  - YouTube URLs (youtube.com/watch?v=…, youtu.be/…) → privacy-mode embed
 *  - Vimeo URLs (vimeo.com/…) → embed
 *
 * Always wrapped in an aspect-ratio container so layout doesn't shift on
 * load. If the URL doesn't match any known provider, falls back to
 * <video> which gracefully shows broken-media UI if it actually 404s.
 */
const YT_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']
const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']
const NATIVE_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i

function youtubeId(url) {
    try {
        const u = new URL(url)
        if (u.hostname === 'youtu.be') return u.pathname.slice(1)
        if (u.searchParams.get('v')) return u.searchParams.get('v')
        // youtube.com/embed/{id}
        const m = u.pathname.match(/\/embed\/([^/]+)/)
        if (m) return m[1]
    } catch {
        // not a parseable URL
    }
    return null
}

function vimeoId(url) {
    try {
        const u = new URL(url)
        const m = u.pathname.match(/\/(\d+)(?:\/|$)/)
        return m ? m[1] : null
    } catch {
        return null
    }
}

const VideoPlayer = ({ url, title = 'Product video', poster }) => {
    if (!url) return null

    let host = ''
    try { host = new URL(url).hostname } catch {}

    const isYT = YT_HOSTS.includes(host)
    const isVimeo = VIMEO_HOSTS.includes(host)
    const isNative = NATIVE_EXT.test(url)

    const Wrapper = ({ children }) => (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
            {children}
        </div>
    )

    if (isYT) {
        const id = youtubeId(url)
        if (!id) return null
        return (
            <Wrapper>
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                    title={title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </Wrapper>
        )
    }

    if (isVimeo) {
        const id = vimeoId(url)
        if (!id) return null
        return (
            <Wrapper>
                <iframe
                    src={`https://player.vimeo.com/video/${id}?dnt=1`}
                    title={title}
                    loading="lazy"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </Wrapper>
        )
    }

    // Treat anything else as HTML5 video. Native <video> handles the
    // unknown-codec case gracefully (browser falls back to "no support").
    return (
        <Wrapper>
            <video
                src={url}
                poster={poster}
                controls
                preload="metadata"
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <track kind="captions" />
            </video>
        </Wrapper>
    )
}

export default VideoPlayer
