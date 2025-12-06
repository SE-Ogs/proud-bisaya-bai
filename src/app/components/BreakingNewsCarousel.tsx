"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface BreakingNewsItem {
  title: string;
  slug: string;
  created_at: string;
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
  autoPlayInterval = 4500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Drag / swipe refs
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAutoPlaying || newsItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, newsItems.length, autoPlayInterval]);

  // Pointer / touch handlers for swipe
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore pointer down when it originates from interactive elements
    // (buttons, links, inputs) so those controls remain functional.
    const target = e.target as HTMLElement | null;
    if (target && target.closest && target.closest('button, a, [role="button"], input, textarea, select')) {
      return;
    }

    startXRef.current = e.clientX;
    pointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore if not supported
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const startX = startXRef.current;
    if (startX == null) return;
    const delta = e.clientX - startX;
    const threshold = Math.min(window.innerWidth * 0.15, 120); // 15% or max 120px

    if (delta > threshold) {
      goToPrevious();
    } else if (delta < -threshold) {
      goToNext();
    }

    // cleanup
    startXRef.current = null;
    if (pointerIdRef.current != null) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch (err) {
        // ignore
      }
      pointerIdRef.current = null;
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = null;
    if (pointerIdRef.current != null) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch (err) {
        // ignore
      }
      pointerIdRef.current = null;
    }
  };

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

  // Calculate which cards to show (center + neighbors)
  const getVisibleCards = () => {
    if (newsItems.length === 0) return [];
    if (newsItems.length === 1) return [{ item: newsItems[0], position: 'center', index: 0 }];
    
    const prevIndex = (currentIndex - 1 + newsItems.length) % newsItems.length;
    const nextIndex = (currentIndex + 1) % newsItems.length;
    
    return [
      { item: newsItems[prevIndex], position: 'left', index: prevIndex },
      { item: newsItems[currentIndex], position: 'center', index: currentIndex },
      { item: newsItems[nextIndex], position: 'right', index: nextIndex },
    ];
  };

  if (newsItems.length === 0) {
    return (
      <div className="bg-gray-100 p-8 rounded-lg text-gray-500 text-center border-2 border-dashed border-gray-300">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="font-semibold">No breaking news at the moment.</p>
        <p className="text-sm mt-1">Check back soon for updates</p>
      </div>
    );
  }

  const visibleCards = getVisibleCards();

  return (
    <div
      className="relative px-4 py-12"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Carousel Container */}
      <div className="relative h-[500px] max-w-6xl mx-auto">
        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center">
          {visibleCards.map(({ item, position, index }) => {
            const isCenter = position === 'center';
            const isLeft = position === 'left';
            const isRight = position === 'right';
            const articlePath = `/articles/${item.category_slug}/${item.subcategory_slug}/${item.slug}`;
            
            return (
              <div
                key={index}
                className={`absolute transition-all duration-500 ease-out cursor-pointer ${
                  isCenter
                    ? 'z-30 scale-100 opacity-100'
                    : 'z-10 scale-75 opacity-60 hover:opacity-80'
                }`}
                style={{
                  transform: `translateX(${isLeft ? '-60%' : isRight ? '60%' : '0'}) scale(${isCenter ? 1 : 0.75})`,
                  width: '850px',
                  maxWidth: '90vw',
                }}
                onClick={() => !isCenter && goToSlide(index)}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
              >
                <Link href={articlePath} className={`rounded-xl shadow-2xl overflow-hidden border-4 block ${
                  isCenter ? 'border-[#9C2222]' : 'border-gray-300'
                }`}>
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.thumbnail_url || "/api/placeholder/500/300"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                    {/* Time badge */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-white font-bold text-lg">
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-white/90 text-xs text-center">
                        {new Date(item.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 bg-[#9C2222]">
                    <h3 className="text-white font-bold text-xl leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-white/90 text-sm mt-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {getTimeAgo(item.created_at)}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {newsItems.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-200 z-40"
              aria-label="Previous news"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-200 z-40"
              aria-label="Next news"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {newsItems.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {newsItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-[#9C2222]"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Demo with sample data
export default BreakingNewsCarousel;