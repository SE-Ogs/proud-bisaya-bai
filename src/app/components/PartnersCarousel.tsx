"use client";

import React, { useState, useEffect, useRef } from "react";

interface Partner {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  url: string | null;
  created_at?: string;
}

interface PartnersCarouselProps {
  partners: Partner[];
  autoPlayInterval?: number;
}

const PartnersCarousel: React.FC<PartnersCarouselProps> = ({
  partners,
  autoPlayInterval = 4500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAutoPlaying || partners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, partners.length, autoPlayInterval]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest &&
      target.closest('button, a, [role="button"], input, textarea, select')
    ) {
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
    const threshold = Math.min(window.innerWidth * 0.15, 120);

    if (delta > threshold) {
      goToPrevious();
    } else if (delta < -threshold) {
      goToNext();
    }

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
    setCurrentIndex((prev) => (prev - 1 + partners.length) % partners.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % partners.length);
    setIsAutoPlaying(false);
  };

  // Calculate which cards to show (center + neighbors)
  const getVisibleCards = () => {
    if (partners.length === 0) return [];
    if (partners.length === 1)
      return [{ partner: partners[0], position: "center", index: 0 }];

    const prevIndex = (currentIndex - 1 + partners.length) % partners.length;
    const nextIndex = (currentIndex + 1) % partners.length;

    return [
      { partner: partners[prevIndex], position: "left", index: prevIndex },
      {
        partner: partners[currentIndex],
        position: "center",
        index: currentIndex,
      },
      { partner: partners[nextIndex], position: "right", index: nextIndex },
    ];
  };

  if (partners.length === 0) {
    return <p className="text-gray-500 text-sm">No partners available.</p>;
  }

  const visibleCards = getVisibleCards();

  return (
    <div
      className="relative px-4 py-8 overflow-visible"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: "pan-y" }}
    >
      {/* Carousel Container */}
      <div className="relative h-[380px] max-w-6xl mx-auto overflow-visible">
        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
          {visibleCards.map(({ partner, position, index }) => {
            const isCenter = position === "center";
            const isLeft = position === "left";
            const isRight = position === "right";

            const cardContent = (
              <div
                className={`flex flex-col items-center transition-all duration-500 ease-out ${
                  isCenter
                    ? "z-30 scale-100 opacity-100"
                    : "z-10 scale-80 opacity-70 hover:opacity-90"
                }`}
                style={{
                  transform: `translateX(${
                    isLeft ? "-50%" : isRight ? "50%" : "0"
                  }) scale(${isCenter ? 1 : 0.8})`,
                  width: "380px",
                  maxWidth: "90vw",
                }}
                onClick={() => !isCenter && goToSlide(index)}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
              >
                <div
                  className={`w-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all ${
                    isCenter
                      ? "border-4 border-[var(--custom-blue)]"
                      : "border-2 border-gray-200"
                  }`}
                >
                  {/* Logo Section */}
                  <div
                    className={`relative flex items-center justify-center ${
                      isCenter ? "h-48 bg-white" : "h-40 bg-white"
                    }`}
                  >
                    {partner.image_url ? (
                      <img
                        src={partner.image_url}
                        alt={partner.name}
                        className="w-full h-full object-contain object-center p-6"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-24 h-24"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div
                    className={`p-6 text-center ${
                      isCenter ? "bg-[var(--custom-blue)]" : "bg-gray-50"
                    } transition-all`}
                  >
                    <h3
                      className={`font-bold mb-2 ${
                        isCenter
                          ? "text-2xl text-white"
                          : "text-lg text-gray-800"
                      }`}
                    >
                      {partner.name}
                    </h3>
                    {partner.description && (
                      <p
                        className={`leading-relaxed ${
                          isCenter
                            ? "text-base text-white/90"
                            : "text-sm text-gray-600"
                        }`}
                      >
                        {partner.description}
                      </p>
                    )}
                    {partner.url && isCenter && (
                      <div className="mt-4 inline-flex items-center gap-2 text-white font-medium text-sm">
                        <span>Visit Website</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );

            if (partner.url && isCenter) {
              return (
                <a
                  key={index}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute cursor-pointer"
                  style={{
                    transform: `translateX(${
                      isLeft ? "-50%" : isRight ? "50%" : "0"
                    }) scale(${isCenter ? 1 : 0.8})`,
                    width: "380px",
                    maxWidth: "90vw",
                  }}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div
                key={index}
                className="absolute cursor-pointer"
                style={{
                  transform: `translateX(${
                    isLeft ? "-50%" : isRight ? "50%" : "0"
                  }) scale(${isCenter ? 1 : 0.8})`,
                  width: "380px",
                  maxWidth: "90vw",
                }}
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {partners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 z-40 border border-gray-200"
              aria-label="Previous partner"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 z-40 border border-gray-200"
              aria-label="Next partner"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {partners.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {partners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-[var(--custom-blue)]"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to partner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play toggle */}
      {partners.length > 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
            aria-label={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
          >
            {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PartnersCarousel;
