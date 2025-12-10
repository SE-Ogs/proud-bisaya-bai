// components/LatestUpdateCard.tsx
import React from "react";

type LatestUpdateCardProps = {
  image: string;
  title: string;
  createdAt: string | Date; // ISO string from Supabase or Date
  author: string;
  reading_time?: number | null;
  locale?: string;
  showSeconds?: boolean;
};

const LatestUpdateCard: React.FC<LatestUpdateCardProps> = ({
  image,
  title,
  createdAt,
  author,
  reading_time,
  locale,
  showSeconds = false,
}) => {
  const dt = new Date(createdAt);
  const dateStr = dt.toLocaleDateString(locale ?? "en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Manila",
  });
  const timeStr = dt.toLocaleTimeString(locale ?? "en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    timeZone: "Asia/Manila",
  });

  return (
    <div className="group bg-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-300 hover:border-[var(--custom-orange)] h-[400px] flex flex-col">
      {/* Image Section - Fixed height */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Reading time badge */}
        {reading_time && (
          <div className="absolute top-3 right-3 bg-gray-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white font-semibold text-sm">
                {reading_time} min
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section - Flexible height */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title - Fixed line clamp */}
        <h4
          className="text-gray-900 font-bold text-lg leading-snug mb-3 transition-colors duration-200 group-hover:text-[var(--custom-orange)] cursor-pointer line-clamp-3"
          title={title}
        >
          {title}
        </h4>

        {/* Spacer to push meta info to bottom */}
        <div className="flex-1"></div>

        {/* Meta Information - Always at bottom */}
        <div className="space-y-2">
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm">
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--custom-orange)" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className="font-medium"
              style={{ color: "var(--custom-orange)" }}
            >
              {dateStr}
            </span>
            <span className="text-gray-400">•</span>
            <span
              className="font-medium"
              style={{ color: "var(--custom-orange)" }}
            >
              {timeStr}
            </span>
          </div>

          {/* Author */}
          {author && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
                By <span className="font-medium text-gray-700">{author}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestUpdateCard;
