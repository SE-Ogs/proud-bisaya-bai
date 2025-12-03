"use client";

import React, { useState } from "react";
import Link from "next/link";
import ArticleList, {
  type ArticleCard as ArticleListCard,
} from "@/app/components/ArticleList";

type SubcategoryPageContentProps = {
  articles: ArticleListCard[];
  title: string;
  subcategories: Array<{ label: string; slug: string }>;
  category: string;
  subcategory: string;
};

// Generic chunk helper for ads
const chunkBy = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function SubcategoryPageContent({
  articles,
  title,
  subcategories,
  category,
  subcategory,
}: SubcategoryPageContentProps) {
  const [displayCount, setDisplayCount] = useState(4);

  const makeSubcatHref = (slug?: string) =>
    slug ? `/articles/${category}/${slug}` : `/articles/${category}`;

  // Pagination
  const displayedArticles = articles.slice(0, displayCount);
  const hasMore = displayCount < articles.length;
  const loadMore = () => setDisplayCount((prev) => prev + 4);

  // After every 4 articles, show an advertisement
  const articleChunks = chunkBy<ArticleListCard>(displayedArticles, 4);

  return (
    <>
      {/* Back to Articles */}
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          <span>Back to Articles</span>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6 text-black">{title}</h1>

      {/* Subcategory chips */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href={makeSubcatHref(undefined)}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            >
              All
            </Link>

            {subcategories.map((s) => {
              const isActive = s.slug === subcategory;
              return (
                <Link
                  key={s.slug}
                  href={makeSubcatHref(s.slug)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--custom-orange)] text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {articles.length === 0 ? (
        <p className="text-gray-600">No articles found in this subcategory.</p>
      ) : (
        <>
          {articleChunks.map((chunk, idx) => (
            <React.Fragment key={idx}>
              {/* 4-article block */}
              <div className="mb-10">
                <ArticleList articles={chunk} />
              </div>

              {/* Advertisement after each 4-article block, except the last */}
              {idx < articleChunks.length - 1 && (
                <div className="mt-2 mb-12">
                  <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm max-w-5xl mx-auto h-28 flex items-center justify-center border border-gray-200">
                    <span className="text-gray-600 text-sm">ADS</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8 mt-6">
              <button
                onClick={loadMore}
                className="px-8 py-3 bg-[var(--custom-blue)] text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
              >
                Load More Articles
              </button>
            </div>
          )}

          {/* Showing count */}
          <div className="text-center text-sm text-gray-600 pt-4 pb-6">
            Showing {displayedArticles.length} of {articles.length} articles
          </div>
        </>
      )}
    </>
  );
}
