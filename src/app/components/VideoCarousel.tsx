"use client";

import { useEffect, useRef, useState } from "react";
import VideoCard from "./VideoCard";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getVideoEmbedUrl } from "@/lib/utils/videos";

type Video = {
  id: string;
  title: string;
  url: string;
  platform: "youtube" | "facebook" | "tiktok";
  created_at?: string;
  thumbnail_url?: string | null;
};

type VideoCarouselProps = {
  videos: Video[];
};

export default function VideoCarousel({ videos }: VideoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll("left")}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--custom-blue)] hover:bg-white transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide scroll-smooth snap-x snap-mandatory"
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className="snap-start shrink-0 w-[220px] sm:w-[260px]"
          >
            <VideoCard
              id={video.id}
              title={video.title}
              url={video.url}
              platform={video.platform}
              created_at={video.created_at}
              thumbnailUrl={video.thumbnail_url}
              onPlay={() => {
                if (
                  video.platform === "facebook" ||
                  video.platform === "tiktok"
                ) {
                  window.open(video.url, "_blank", "noopener,noreferrer");
                } else {
                  setActiveVideo(video);
                }
              }}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll("right")}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--custom-blue)] hover:bg-white transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {activeVideo &&
        (() => {
          const embedSrc = getVideoEmbedUrl(
            activeVideo.platform,
            activeVideo.url
          );
          if (!embedSrc) return null;

          const srcWithAutoplay =
            activeVideo.platform === "youtube"
              ? `${embedSrc}?autoplay=1`
              : `${embedSrc}&autoplay=true`;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
              <div
                className="absolute inset-0"
                onClick={() => setActiveVideo(null)}
              />
              <div className="relative z-10 w-full max-w-5xl">
                <button
                  aria-label="Close video"
                  onClick={() => setActiveVideo(null)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300"
                >
                  <X className="h-8 w-8" />
                </button>
                <div className="relative w-full pt-[56.25%] bg-black rounded-2xl overflow-hidden">
                  <iframe
                    src={srcWithAutoplay}
                    title={activeVideo.title}
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <p className="mt-4 text-center text-white text-lg font-semibold">
                  {activeVideo.title}
                </p>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
