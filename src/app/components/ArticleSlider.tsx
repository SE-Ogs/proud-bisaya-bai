"use client";

import React, { useState, useMemo } from "react";
import { NavigationLink as Link } from "@/app/components/NavigationLink";
import { Search } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Article {
  id: number;
  title: string;
  author: string;
  created_at: string;
  category: string;
  subcategory: string | null;
  slug: string;
  thumbnail_url: string | null;
  category_slug: string;
  subcategory_slug: string | null;
}

interface ArticleSliderProps {
  articles: Article[];
}

export default function ArticleSlider({ articles }: ArticleSliderProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(8);

  // Define visible category tabs
  const categories = [
    { id: "all", label: "For you" },
    { id: "brands", label: "Brands" },
    { id: "stories", label: "Stories" },
    { id: "destination", label: "Destination" },
    { id: "food", label: "Food" },
    { id: "lifestyles", label: "Lifestyles" },
  ];

  // Normalize comparison (lowercase) to match DB field
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (a) => a.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [articles, activeCategory, searchQuery]);

  // Reset display count when filters change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setDisplayCount(8);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setDisplayCount(8);
  };

  const displayedArticles = filteredArticles.slice(0, displayCount);
  const hasMore = displayCount < filteredArticles.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + 8);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Search and Category Bar - positioned below header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-200 shadow-sm mt-14">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo + Search */}
          <div className="flex items-center gap-4 w-full lg:w-1/2">
            <h1 className="text-2xl font-bold text-gray-900">Proud Bisaya Bai</h1>
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search article"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="overflow-x-auto flex gap-4 text-sm font-medium scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`whitespace-nowrap px-3 py-2 rounded-full transition-colors ${
                  activeCategory === cat.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - flex-1 ensures it takes remaining space */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Articles Section */}
          <section className="lg:col-span-3 space-y-6">
            {filteredArticles.length === 0 ? (
              <div className="text-gray-600 text-center py-12">
                No articles found in this category.
              </div>
            ) : (
              <>
                {displayedArticles.map((article) => {
                  const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;

                  return (
                    <Link
                      key={article.id}
                      href={href}
                      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {article.thumbnail_url && (
                          <div className="sm:w-48 h-40 sm:h-auto overflow-hidden">
                            <img
                              src={article.thumbnail_url}
                              alt={article.title}
                              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                          <p className="text-xs uppercase text-gray-500 mb-2">
                            {article.category}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            By {article.author} •{" "}
                            {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-8">
                    <button
                      onClick={loadMore}
                      className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
                    >
                      Load More Articles
                    </button>
                  </div>
                )}

                {/* Showing count */}
                <div className="text-center text-sm text-gray-600 pt-4 pb-6">
                  Showing {displayedArticles.length} of {filteredArticles.length} articles
                </div>
              </>
            )}
          </section>

          {/* Sidebar Section */}
          <aside className="hidden lg:block space-y-8">
            {/* Ad Placeholder */}
            <div className="sticky top-24 space-y-6">
              {/* Reading List */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Reading List
                </h2>
                <ul className="space-y-4">
                  {filteredArticles.slice(0, 3).map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/articles/${a.category_slug}/${a.subcategory_slug}/${a.slug}`}
                        className="flex gap-3 items-center hover:text-blue-600 transition-colors"
                      >
                        {a.thumbnail_url && (
                          <img
                            src={a.thumbnail_url}
                            alt={a.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {a.title}
                          </p>
                          <p className="text-xs text-gray-500">{a.category}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Ad Placeholders */}
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                <img
                  src="images/ads_placeholder.webp"
                  alt="Advertisement 1"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                <img
                  src="images/ads_placeholder.webp"
                  alt="Advertisement 2"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                <img
                  src="images/ads_placeholder.webp"
                  alt="Advertisement 3  "
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}