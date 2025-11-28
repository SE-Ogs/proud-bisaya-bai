"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string;
  created_at: string;
  category_slug: string;
  subcategory_slug: string;
  content?: any;
  author?: string;
}

interface SuggestedArticlesCarouselProps {
  articles: Article[];
  currentArticleId?: string;
}

export default function SuggestedArticlesCarousel({
  articles,
  currentArticleId,
}: SuggestedArticlesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);

  // Simple drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Filter out current article
  const filteredArticles = articles.filter(
    (article) => article.id !== currentArticleId
  );

  // Update scroll state
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const totalScrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    setScrollPosition(scrollLeft);
    setMaxScroll(totalScrollWidth - clientWidth);
    setContainerWidth(clientWidth);
    setScrollWidth(totalScrollWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < totalScrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollState, {
        passive: true,
      });
      window.addEventListener("resize", updateScrollState);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      }
    };
  }, [articles]);

  // Simple drag-to-scroll handlers - direct and responsive
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    const container = scrollContainerRef.current;
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // Slight multiplier for better feel
    container.scrollLeft = scrollLeft - walk;
  };

  // Handle scrollbar click - use native smooth scrolling
  const handleScrollbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    const scrollbarTrack = e.currentTarget;
    const rect = scrollbarTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;

    const container = scrollContainerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetScroll = Math.max(
      0,
      Math.min(maxScroll, percentage * maxScroll)
    );

    // Use native smooth scrolling
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  if (filteredArticles.length === 0) {
    return null;
  }

  // Calculate scrollbar thumb width and position
  const thumbWidth =
    scrollWidth > 0 ? (containerWidth / scrollWidth) * 100 : 100;
  const thumbPosition =
    maxScroll > 0 ? (scrollPosition / maxScroll) * (100 - thumbWidth) : 0;

  return (
    <div className="mt-0 pt-0 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        You may also like
      </h2>

      <div className="relative flex justify-center">
        {/* Carousel Container - Limited to show 3 cards at a time */}
        <div
          className="overflow-hidden mx-auto"
          style={{
            maxWidth: "calc(3 * (230px + 16px) - 16px)",
          }}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {filteredArticles.map((article) => {
              const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;
              const formattedDate = formatDate(article.created_at);
              const authorName = article.author || "Unknown";

              return (
                <Link
                  key={article.id}
                  href={href}
                  className="flex-shrink-0 w-[230px] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="relative h-[300px] overflow-hidden">
                    <img
                      src={article.thumbnail_url || "/images/banner.webp"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-base font-bold mb-2 text-white group-hover:text-[var(--custom-orange)] transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-white/90">
                        <time dateTime={article.created_at}>
                          {formattedDate}
                        </time>
                        <span>•</span>
                        <span>{authorName}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar with Navigation */}
      <div
        className="mt-4 flex items-center gap-2 justify-center mx-auto"
        style={{ maxWidth: "calc(3 * (230px + 16px) - 16px)" }}
      >
        <button
          onClick={() => {
            if (!scrollContainerRef.current) return;
            const container = scrollContainerRef.current;
            const cardWidth = 230;
            const gap = 16;
            const scrollAmount = cardWidth + gap;
            container.scrollBy({
              left: -scrollAmount,
              behavior: "smooth",
            });
          }}
          disabled={!canScrollLeft}
          className={`text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 p-1 ${
            !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div
          className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden relative cursor-pointer"
          onClick={handleScrollbarClick}
        >
          <div
            className="h-full rounded-full transition-all duration-200 absolute cursor-pointer hover:opacity-80"
            style={{
              width: `${Math.max(10, Math.min(thumbWidth, 100))}%`,
              left: `${thumbPosition}%`,
              minWidth: "30px",
              backgroundColor: "var(--custom-blue)",
            }}
          />
        </div>
        <button
          onClick={() => {
            if (!scrollContainerRef.current) return;
            const container = scrollContainerRef.current;
            const cardWidth = 230;
            const gap = 16;
            const scrollAmount = cardWidth + gap;
            container.scrollBy({
              left: scrollAmount,
              behavior: "smooth",
            });
          }}
          disabled={!canScrollRight}
          className={`text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 p-1 ${
            !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
