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

// Calculate read time based on content
// function calculateReadTime(content: any): number {
//   if (!content) return 4; // Default 4 minutes

//   let textLength = 0;

//   try {
//     const contentData =
//       typeof content === "string" ? JSON.parse(content) : content;
//     const contentArray = Array.isArray(contentData)
//       ? contentData
//       : contentData.content || [];

//     // Extract text from all components
//     contentArray.forEach((component: any) => {
//       if (component.props) {
//         if (component.props.text) {
//           textLength += component.props.text.length;
//         }
//         if (component.props.content) {
//           // For rich text, estimate text length (remove HTML tags)
//           const textOnly = component.props.content.replace(/<[^>]*>/g, "");
//           textLength += textOnly.length;
//         }
//       }
//     });
//   } catch (e) {
//     // If parsing fails, default to 4 minutes
//     return 4;
//   }

//   // Average reading speed: 200 words per minute
//   // Average word length: 5 characters
//   const words = textLength / 5;
//   const minutes = Math.ceil(words / 200);

//   return Math.max(1, Math.min(minutes, 10)); // Between 1 and 10 minutes
// }

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

  // Drag-to-scroll state
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

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
      container.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      }
    };
  }, [articles]);

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDown(true);
    const container = scrollContainerRef.current;
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftStart(container.scrollLeft);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "";
  };

  const handleMouseUp = () => {
    setIsDown(false);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    const x = e.pageX - container.offsetLeft;
    const walk = x - startX;
    container.scrollLeft = scrollLeftStart - walk;
  };

  // const scroll = (direction: "left" | "right") => {
  //   if (!scrollContainerRef.current) return;

  //   const container = scrollContainerRef.current;
  //   // Scroll by one card width (230px) + gap (16px) = 246px
  //   const cardWidth = 230;
  //   const gap = 16;
  //   const scrollAmount = cardWidth + gap;
  //   const targetScroll =
  //     container.scrollLeft +
  //     (direction === "left" ? -scrollAmount : scrollAmount);

  //   // Fast smooth scroll with custom duration
  //   const startScroll = container.scrollLeft;
  //   const distance = targetScroll - startScroll;
  //   const duration = 300; // 300ms for faster scrolling
  //   let startTime: number | null = null;

  //   const animateScroll = (currentTime: number) => {
  //     if (startTime === null) startTime = currentTime;
  //     const timeElapsed = currentTime - startTime;
  //     const progress = Math.min(timeElapsed / duration, 1);

  //     // Easing function for smooth acceleration/deceleration
  //     const ease =
  //       progress < 0.5
  //         ? 2 * progress * progress
  //         : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  //     container.scrollLeft = startScroll + distance * ease;

  //     if (progress < 1) {
  //       requestAnimationFrame(animateScroll);
  //     }
  //   };

  //   requestAnimationFrame(animateScroll);
  // };

  // Handle scrollbar click to scroll with snapping to cards
  const handleScrollbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    const scrollbarTrack = e.currentTarget;
    const rect = scrollbarTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;

    const container = scrollContainerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetScroll = percentage * maxScroll;

    // Calculate card width + gap for snapping
    const cardWidth = 230;
    const gap = 16;
    const cardWithGap = cardWidth + gap;

    // Snap to nearest card position
    const snappedScroll = Math.round(targetScroll / cardWithGap) * cardWithGap;
    const finalScroll = Math.min(Math.max(0, snappedScroll), maxScroll);

    // Fast smooth scroll for scrollbar clicks
    const startScroll = container.scrollLeft;
    const distance = finalScroll - startScroll;
    const duration = 400; // 400ms for scrollbar clicks
    let startTime: number | null = null;

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function for smooth acceleration/deceleration
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      container.scrollLeft = startScroll + distance * ease;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
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
  // Thumb width represents visible portion of content
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
        {/* Navigation Arrows - Commented out */}
        {/* <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-xl hover:bg-gray-100 transition-all border-2 border-gray-200 ${
            canScrollLeft ? "opacity-100" : "opacity-30 cursor-not-allowed"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-xl hover:bg-gray-100 transition-all border-2 border-gray-200 ${
            canScrollRight ? "opacity-100" : "opacity-30 cursor-not-allowed"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button> */}

        {/* Carousel Container - Limited to show 3 cards at a time */}
        <div
          className="overflow-hidden mx-auto"
          style={{
            maxWidth: "calc(3 * (230px + 16px) - 16px)", // 3 cards: 230px each + 16px gap between
          }}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {filteredArticles.map((article) => {
              const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;
              // const readTime = calculateReadTime(article.content);
              const formattedDate = formatDate(article.created_at);
              const authorName = article.author || "Unknown";

              return (
                <Link
                  key={article.id}
                  href={href}
                  className="flex-shrink-0 w-[230px] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
                  style={{ scrollSnapAlign: "start" }}
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
            className="h-full rounded-full transition-all duration-300 absolute cursor-pointer hover:opacity-80"
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
