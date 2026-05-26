import { categories } from "@/assets/assets";
import Link from "next/link";

const CategoriesMarquee = () => {
    return (
        <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
            <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-[color:var(--color-surface)] to-transparent" />
            <div className="flex min-w-[200%] animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-4">
                {[...categories, ...categories, ...categories, ...categories].map((category, index) => (
                    <Link
                        href={`/shop?category=${category.toLowerCase()}`}
                        key={index}
                        className="px-5 py-2 bg-white border border-[color:var(--color-border)] rounded-full text-[color:var(--color-text-2)] text-xs sm:text-sm whitespace-nowrap hover:bg-[color:var(--color-brand)] hover:text-white hover:border-[color:var(--color-brand)] active:scale-95 transition-all duration-300"
                    >
                        {category}
                    </Link>
                ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[color:var(--color-surface)] to-transparent" />
        </div>
    );
};

export default CategoriesMarquee;
