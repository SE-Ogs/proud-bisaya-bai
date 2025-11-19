"use client";

import React, { useState, useEffect } from "react";

type SearchBarProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
};

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search articles...",
  className = "",
  inputClassName = "",
  inputRef,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Keep local input in sync if parent value changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => {
          const v = e.target.value;
          setLocalValue(v);
          onChange(v); // instant, no debounce
        }}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition ${inputClassName}`}
        aria-label="Search articles"
      />
      {/* Search icon */}
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      {/* Clear button */}
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue("");
            onChange("");
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          title="Clear"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
