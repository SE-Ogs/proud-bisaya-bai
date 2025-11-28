"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface BreakingNewsItem {
    title: string;
    slug: string;
    created_at: string;
    author?: string | null;
    category_slug: string;
    subcategory_slug: string;
    thumbnail_url: string | null;
}

interface BreakingNewsCarouselProps {
    newsItems: BreakingNewsItem[];
    autoPlayInterval?: number;
}

const BreakingNewsCarousel: React.FC<BreakingNewsCarouselProps> = ({
    newsItems,
    autoPlayInterval = 5000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying || newsItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % newsItems.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isAutoPlaying, newsItems.length, autoPlayInterval]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    setIsAutoPlaying(false);
    };

    const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    setIsAutoPlaying(false);
    };
    
    const getTimeAgo = (createdAt: string) => {
        const now = new Date();
        const postDate = new Date(createdAt);
        const diffMs = now.getTime() - postDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    };

    if(newsItems.length === 0) {
        return (
            <div className="bg-gray-100 p-8 rounded-lg text-gray-500 text-center border-2 border-dashed border-gray-300">
                <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <p className="font-semibold">No breaking news at the moment.</p>
        <p className="text-sm mt-1">Check back soon for updates</p>
      </div>
    );
}

const currentNews = newsItems[currentIndex];

return (
    <div className="relative">
      {/* Main Carousel */}
      <Link
        href={`/articles/${currentNews.category_slug}/${currentNews.subcategory_slug}/${currentNews.slug}`}
        className="block rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-4 overflow-hidden group"
        style={{ borderColor: "var(--custom-red)" }}
      >
        {/* Image Section */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={currentNews.thumbnail_url || "/images/banner.webp"}
            alt={currentNews.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Counter badge */}
          {newsItems.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <p className="text-white font-bold text-sm">
                {currentIndex + 1} / {newsItems.length}
              </p>
            </div>
          )}

          {/* Time badge */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white font-bold text-lg">
              {new Date(currentNews.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-white/90 text-xs text-center">
              {new Date(currentNews.created_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Navigation Arrows - Only show if multiple items */}
          {newsItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 z-10"
                aria-label="Previous news"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 z-10"
                aria-label="Next news"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Content Section */}
        <div
          className="p-6"
          style={{ backgroundColor: "var(--custom-red)" }}
        >
          <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight">
            {currentNews.title}
          </h3>
          <div className="text-white/90 text-sm mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                {new Date(currentNews.created_at).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-white/60">•</span>
              <span className="font-medium">
                {new Date(currentNews.created_at).toLocaleTimeString("en-PH", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Manila",
                })}
              </span>
            </div>
            {currentNews.author && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
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
                  By <span className="font-medium">{currentNews.author}</span>
                </span>
              </div>
            )}
            <p className="text-white/80 text-xs mt-2 italic">
              Click to read full story
            </p>
          </div>
        </div>
      </Link>

      {/* Dot Indicators - Only show if multiple items */}
      {newsItems.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {newsItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-[var(--custom-red)]"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play toggle - Only show if multiple items */}
      {newsItems.length > 1 && (
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all duration-200 text-xs font-medium"
          aria-label={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
        >
          {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
      )}
    </div>
);
};

export default BreakingNewsCarousel;