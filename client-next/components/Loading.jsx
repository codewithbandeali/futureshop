'use client'

const Loading = ({ className = '' }) => {
    return (
        <div className={`flex items-center justify-center h-screen ${className}`}>
            <div
                role="status"
                aria-label="Loading"
                className="w-10 h-10 rounded-full border-[3px] border-[color:var(--color-border)] border-t-[color:var(--color-brand)] animate-spin"
            />
        </div>
    )
}

export default Loading
