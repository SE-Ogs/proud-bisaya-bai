"use client";

import React, { useState, useMemo, useEffect } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import ArticleList, {
  type ArticleCard as ArticleListCard,
} from "@/app/components/ArticleList";
import { NavigationLink as Link } from "@/app/components/NavigationLink";
import SearchBar from "@/app/components/SearchBar";

type ArticlesPageContentProps = {
  articles: any[];
  categories: any[];
};

const titleize = (slug: string) =>
  (slug || "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

// Generic chunk helper for ads
const chunkBy = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function ArticlesPageContent({
  articles,
  categories,
}: ArticlesPageContentProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState<
    string | undefined
  >(undefined);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Reset pagination when filters/search change
  useEffect(() => {
    setDisplayCount(8);
    // Show brief loading state when filters change
    if (activeCategory !== "all" || activeSubcategory || searchQuery) {
      setIsFiltering(true);
      const timer = setTimeout(() => setIsFiltering(false), 200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeCategory, activeSubcategory]);

  // 1) Filter by category/subcategory first
  const categoryFiltered = useMemo(() => {
    if (activeCategory === "all") return articles;

    let filtered = (articles as any[]).filter(
      (article) => article.category_slug === activeCategory
    );

    if (activeSubcategory) {
      filtered = filtered.filter(
        (article) => article.subcategory_slug === activeSubcategory
      );
    }

    return filtered;
  }, [articles, activeCategory, activeSubcategory]);

  // 2) Shape into ArticleListCard[] and apply search filter
  const shapedArticles: ArticleListCard[] = useMemo(() => {
    const base: ArticleListCard[] = (categoryFiltered as any[]).map((a) => {
      const category_name =
        a.category_name?.trim?.() ||
        a.category?.trim?.() ||
        titleize(a.category_slug);
      const subcategory_name =
        a.subcategory_name?.trim?.() ||
        a.subcategory?.trim?.() ||
        titleize(a.subcategory_slug);

      return {
        slug: a.slug,
        title: a.title,
        thumbnail_url: a.thumbnail_url ?? null,
        created_at: a.created_at,
        category_slug: a.category_slug,
        subcategory_slug: a.subcategory_slug,
        category_name,
        subcategory_name,
        author: a.author ?? null,
        reading_time: a.reading_time ?? null,
      };
    });

    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;

    return base.filter((item) => {
      const inTitle = item.title?.toLowerCase().includes(q);
      const inAuthor = item.author?.toLowerCase().includes(q);
      const inCat = item.category_name?.toLowerCase().includes(q);
      const inSubcat = item.subcategory_name?.toLowerCase().includes(q);
      return inTitle || inAuthor || inCat || inSubcat;
    });
  }, [categoryFiltered, searchQuery]);

  // Derived title
  const getFilterTitle = () => {
    if (activeCategory === "all") return "All Articles";

    const category = categories.find((c: any) => c.slug === activeCategory);
    if (!category) return "All Articles";

    if (activeSubcategory) {
      const subcategory = category.subcategories?.find(
        (s: any) => s.slug === activeSubcategory
      );
      return subcategory
        ? `${category.label} - ${subcategory.label}`
        : category.label;
    }

    return category.label;
  };

  // Get subcategories for active category
  const activeSubcategories = useMemo(() => {
    if (activeCategory === "all") return [];
    const category = categories.find((c: any) => c.slug === activeCategory);
    return category?.subcategories || [];
  }, [activeCategory, categories]);

  // Pagination + ads
  const displayedArticles = shapedArticles.slice(0, displayCount);
  const hasMore = displayCount < shapedArticles.length;
  const loadMore = () => {
    setIsLoadingMore(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setDisplayCount((prev) => prev + 8);
      setIsLoadingMore(false);
    }, 300);
  };

  // After every 4 articles, show an advertisement
  const articleChunks = chunkBy<ArticleListCard>(displayedArticles, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-14">
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Back to Home */}
          <div className="mb-6">
            <Link
              href="/"
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
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, category, or subcategory..."
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setActiveSubcategory(undefined);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === "all"
                    ? "bg-[var(--custom-blue)] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((category: any) => (
                <button
                  key={category.slug}
                  onClick={() => {
                    setActiveCategory(category.slug);
                    setActiveSubcategory(undefined);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === category.slug
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory Filter (only show if category is selected) */}
          {activeCategory !== "all" && activeSubcategories.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSubcategory(undefined)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !activeSubcategory
                      ? "bg-[var(--custom-orange)] text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                {activeSubcategories.map((subcategory: any) => (
                  <button
                    key={subcategory.slug}
                    onClick={() => setActiveSubcategory(subcategory.slug)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeSubcategory === subcategory.slug
                        ? "bg-[var(--custom-orange)] text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {subcategory.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title and count */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{getFilterTitle()}</h1>
            <p className="text-gray-600">
              {isFiltering ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--custom-orange)] border-t-transparent rounded-full animate-spin"></span>
                  Filtering...
                </span>
              ) : (
                <>
                  {shapedArticles.length}{" "}
                  {shapedArticles.length === 1 ? "article" : "articles"} found
                </>
              )}
            </p>
          </div>

          {isFiltering ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[var(--custom-orange)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading articles...</p>
              </div>
            </div>
          ) : shapedArticles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No articles found.</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setActiveSubcategory(undefined);
                  setDisplayCount(8);
                  setSearchQuery("");
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View All Articles
              </button>
            </div>
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
                    disabled={isLoadingMore}
                    className="px-8 py-3 bg-[var(--custom-blue)] text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      "Load More Articles"
                    )}
                  </button>
                </div>
              )}

              {/* Showing count */}
              <div className="text-center text-sm text-gray-600 pt-4 pb-6">
                Showing {displayedArticles.length} of {shapedArticles.length}{" "}
                articles
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
