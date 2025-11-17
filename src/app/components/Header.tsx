"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
};

const defaultItems: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "Articles", href: "/articles" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Destinations", href: "/articles/destinations" },
  { label: "Stories", href: "/articles/stories" },
  { label: "Food", href: "/articles/food" },
  { label: "Brands and Products", href: "/articles/brands-and-products" },
  { label: "News and Entertainment", href: "/articles/news-and-entertainment" },
];

export default function Navbar({
  items = defaultItems,
}: {
  items?: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { coreItems, categoryItems } = useMemo(() => {
    const idx = items.findIndex(
      (i) => i.label.toLowerCase() === "destinations"
    );
    if (idx === -1) {
      return { coreItems: items, categoryItems: [] as NavItem[] };
    }
    return { coreItems: items.slice(0, idx), categoryItems: items.slice(idx) };
  }, [items]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const width = isOpen ? "240px" : "0px";
      document.documentElement.style.setProperty("--sidebar-width", width);
    }
  }, [isOpen]);

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[var(--custom-orange)] shadow-md">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/home" aria-label="Go to home" title="Home">
              <img
                src="/images/pbb_hd_logo.webp"
                alt="Proud Bisaya Bai"
                width={50}
                height={50}
                className="h-10 w-auto object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* Categories - visible on all screens */}
          <div className="flex items-center gap-2 flex-wrap flex-1 justify-center">
            {categoryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-[var(--custom-brown)] text-xs md:text-sm font-semibold transition-all hover:scale-105 whitespace-nowrap"
                title={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Burger button - always visible */}
          <button
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen((v) => !v)}
            className="rounded p-2 text-xl hover:scale-110 flex-shrink-0"
            title={isOpen ? "Close" : "Open"}
          >
            <img
              src="/images/burger_brown.webp"
              alt={isOpen ? "Close menu" : "Open menu"}
              width={30}
              height={30}
              className="cursor-pointer"
            />
          </button>
        </div>
      </div>

      {/* Sidebar Nav - contains core pages */}
      <aside
        className="fixed top-0 right-0 h-screen z-50 border-l border-gray-200 shadow-lg"
        style={{
          width: isOpen ? 260 : 0,
          overflow: "hidden",
          transition: "width 200ms ease",
          backgroundImage: "url('/images/pbb_hd_logo.webp')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "white",
        }}
      >
        <div className="absolute inset-0 bg-white opacity-70 pointer-events-none" />

        {isOpen && (
          <div className="flex flex-col h-full relative z-10">
            <div className="sticky top-0 z-10 bg-white bg-opacity-90">
              <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-700">
                  Menu
                </span>
                <button
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                  className="rounded p-2 text-xl text-black hover:scale-110"
                  title="Close"
                >
                  <img
                    src="/images/close_brown.webp"
                    alt="Close menu"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </button>
              </div>
            </div>

            <nav className="px-2 py-3 overflow-y-auto flex-1">
              {/* Core pages */}
              <div className="space-y-1">
                {coreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded px-3 py-2 text-sm text-black font-bold hover:bg-gray-100"
                    title={item.label}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Get Featured button */}
              <div className="px-3 mt-6">
                <Link
                  href="/contact-us"
                  title="Get Featured"
                  className="w-full inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[var(--custom-brown)] to-[var(--custom-orange)] text-white text-sm font-semibold px-4 py-2 transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95"
                  onClick={() => setIsOpen(false)}
                >
                  Get Featured
                </Link>
              </div>
            </nav>
          </div>
        )}
      </aside>
    </>
  );
}
