/**
 * Skeleton loader for blog post list.
 * Matches the blog post layout structure.
 */
export function BlogPostSkeleton() {
  return (
    <article className="py-12 border-t border-[#D4A574]/10">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Date column skeleton */}
        <div className="lg:col-span-3">
          <div className="h-4 w-24 bg-[#D4A574]/20 rounded animate-pulse"></div>
        </div>

        {/* Content column skeleton */}
        <div className="lg:col-span-9 space-y-4">
          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-8 bg-[#D4A574]/20 rounded animate-pulse w-3/4"></div>
            <div className="h-8 bg-[#D4A574]/20 rounded animate-pulse w-1/2"></div>
          </div>

          {/* Excerpt skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-5 bg-[#D4A574]/15 rounded animate-pulse w-full"></div>
            <div className="h-5 bg-[#D4A574]/15 rounded animate-pulse w-full"></div>
            <div className="h-5 bg-[#D4A574]/15 rounded animate-pulse w-4/5"></div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * List of skeleton loaders.
 * Shows multiple placeholder posts during loading.
 */
export function BlogPostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <BlogPostSkeleton key={index} />
      ))}
    </div>
  );
}
