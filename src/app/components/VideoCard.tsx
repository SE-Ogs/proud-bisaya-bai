"use client";

import { useMemo, useState } from "react";
import {
  getVideoEmbedUrl,
  getVideoThumbnailUrl,
  VideoPlatform,
} from "@/lib/utils/videos";

type VideoCardProps = {
  id: string;
  title: string;
  url: string;
  platform: VideoPlatform;
  created_at?: string;
  orientation?: "vertical" | "horizontal";
  onPlay?: () => void;
  thumbnailUrl?: string | null;
  disablePlay?: boolean;
};

export default function VideoCard({
  title,
  url,
  platform,
  orientation = "vertical",
  onPlay,
  thumbnailUrl,
  disablePlay = false,
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getVideoEmbedUrl(platform, url);
  const fallbackThumb = getVideoThumbnailUrl(platform, url);
  const thumbnail = thumbnailUrl || fallbackThumb;
  const isHorizontal = orientation === "horizontal";

  const autoplayEmbedSrc = useMemo(() => {
    if (!embedUrl) return null;
    if (platform === "youtube") {
      return `${embedUrl}?autoplay=1&rel=0`;
    }
    if (platform === "facebook") {
      return `${embedUrl}&autoplay=true`;
    }
    return embedUrl;
  }, [embedUrl, platform]);

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
      return;
    }
    if (embedUrl) {
      setIsPlaying(true);
    }
  };

  const mediaContent = (
    <div className="absolute inset-0">
      {!onPlay && !disablePlay && isPlaying && autoplayEmbedSrc ? (
        <iframe
          src={autoplayEmbedSrc}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div
          className={`relative flex h-full w-full items-center justify-center overflow-hidden ${
            !disablePlay ? "cursor-pointer" : ""
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: thumbnail
                ? `url(${thumbnail})`
                : "linear-gradient(135deg, #1f2a44 0%, #0b1628 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {!disablePlay && (
            <button
              type="button"
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--custom-orange)] text-white shadow-sm transition-transform hover:scale-110"
              onClick={() => embedUrl && handlePlay()}
            >
              <svg
                className="h-6 w-6 translate-x-1.0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isHorizontal) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-[var(--custom-blue)] text-white shadow-md ring-1 ring-white/5 sm:flex-row">
        <div className="w-full sm:w-1/2">
          <div className="relative w-full overflow-hidden aspect-video min-h-[220px]">
            {mediaContent}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--custom-orange)]">
            {platform}
          </p>
          <h4 className="mt-2 text-lg font-semibold leading-tight break-words">
            {title}
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#0b1628] text-white shadow-md ring-1 ring-white/5">
      <div className="relative w-full overflow-hidden h-[360px] rounded-t-2xl">
        {mediaContent}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">
          {platform}
        </p>
        <h4 className="mt-2 text-lg font-semibold leading-tight break-words">
          {title}
        </h4>
      </div>
    </div>
  );
}
