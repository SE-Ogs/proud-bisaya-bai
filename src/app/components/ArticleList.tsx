// app/components/ArticleList.tsx
import { NavigationLink as Link } from "@/app/components/NavigationLink";

export type ArticleCard = {
  slug: string;
  title: string;
  thumbnail_url?: string | null;
  created_at: string;
  category_slug: string;
  subcategory_slug: string;
  category_name?: string | null;
  subcategory_name?: string | null;
  author: string | null;
  reading_time?: number | null;
};

export default function ArticleList({ articles }: { articles: ArticleCard[] }) {
  if (!articles?.length)
    return <p className="text-gray-600">No articles found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {articles.map((article) => {
        const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;

        // Author: only fallback if null/undefined (keeps user-provided strings even if they contain spaces)
        const author = article.author ?? "Unknown";

        // Category/Subcategory: never show slugs in labels. If missing, hide the chip.
        const categoryLabel = article.category_name?.trim();
        const subcategoryLabel = article.subcategory_name?.trim();

        return (
          <Link
            key={article.slug}
            href={href}
            className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 flex flex-col h-[500px]"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden flex-shrink-0">
              <img
                src={article.thumbnail_url || "/images/banner.webp"}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Reading time badge */}
              {article.reading_time && (
                <div className="absolute top-3 right-3 bg-gray-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white font-semibold text-sm">
                      {article.reading_time} min
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 min-h-0">
              {/* Category chips (names only) */}
              {(categoryLabel || subcategoryLabel) && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  {categoryLabel && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--custom-blue)]/10 text-[var(--custom-blue)]">
                      {categoryLabel}
                    </span>
                  )}
                  {subcategoryLabel && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--custom-orange)]/10 text-[var(--custom-orange)]">
                      {subcategoryLabel}
                    </span>
                  )}
                </div>
              )}

              {/* Title: responsive clamps (3 lines on mobile, 2 on md+) */}
              <h4 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-[var(--custom-orange)] transition-colors duration-200 break-words">
                {article.title}
              </h4>

              {/* Spacer to pin meta at bottom */}
              <div className="flex-1" />

              {/* Meta */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    {new Date(article.created_at).toLocaleString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    By{" "}
                    <span className="font-medium text-gray-800">{author}</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
