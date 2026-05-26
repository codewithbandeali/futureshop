import { Star } from "lucide-react"

const Rating = ({ value = 0 }) => {
    return (
        <div className="flex items-center" aria-label={`Rated ${value} out of 5`}>
            {[1, 2, 3, 4, 5].map(n => (
                <Star
                    key={n}
                    size={16}
                    fill={value >= n ? 'var(--color-warning)' : 'transparent'}
                    className={value >= n ? 'text-[color:var(--color-warning)]' : 'text-[color:var(--color-text-3)]'}
                />
            ))}
        </div>
    )
}

export default Rating
