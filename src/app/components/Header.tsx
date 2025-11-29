"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

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

// Subcategories for each category
const subcategories: Record<string, { label: string; href: string }[]> = {
  Destinations: [
    {
      label: "Cebu Highlights",
      href: "/articles/destinations/cebu-highlights",
    },
    {
      label: "Beaches & Islands",
      href: "/articles/destinations/beaches-islands",
    },
    {
      label: "Mountain Escapes",
      href: "/articles/destinations/mountain-escapes",
    },
    {
      label: "Heritage & History",
      href: "/articles/destinations/heritage-history",
    },
    { label: "Hidden Gems", href: "/articles/destinations/hidden-gems" },
    {
      label: "Travel Itineraries",
      href: "/articles/destinations/travel-itineraries",
    },
  ],
  Stories: [
    { label: "Life in Cebu", href: "/articles/stories/life-in-cebu" },
    {
      label: "Resilience & Recovery",
      href: "/articles/stories/resilience-recovery",
    },
    { label: "Student Stories", href: "/articles/stories/student-stories" },
    {
      label: "Entrepreneur Journeys",
      href: "/articles/stories/entrepreneur-journeys",
    },
    {
      label: "Cultural Narratives",
      href: "/articles/stories/cultural-narratives",
    },
    {
      label: "Inspirational Profiles",
      href: "/articles/stories/inspirational-profiles",
    },
  ],
  Food: [
    { label: "Cebu Favorites", href: "/articles/food/cebu-favorites" },
    { label: "Street Food Finds", href: "/articles/food/street-food-finds" },
    { label: "Café & Coffee Spots", href: "/articles/food/cafe-coffee-spots" },
    { label: "Seafood Specials", href: "/articles/food/seafood-specials" },
    {
      label: "Sweet Treats & Desserts",
      href: "/articles/food/sweet-treats-desserts",
    },
    { label: "Food Reviews", href: "/articles/food/food-reviews" },
  ],
  "Brands and Products": [
    {
      label: "Homegrown Brands",
      href: "/articles/brands-and-products/homegrown-brands",
    },
    {
      label: "Fashion & Apparel",
      href: "/articles/brands-and-products/fashion-apparel",
    },
    {
      label: "Tech & Gadgets",
      href: "/articles/brands-and-products/tech-gadgets",
    },
    {
      label: "Beauty & Wellness",
      href: "/articles/brands-and-products/beauty-wellness",
    },
    {
      label: "Food Products",
      href: "/articles/brands-and-products/food-products",
    },
    {
      label: "Eco-Friendly & Sustainable",
      href: "/articles/brands-and-products/eco-friendly-sustainable",
    },
  ],
  "News and Entertainment": [
    {
      label: "Breaking News Cebu",
      href: "/articles/news-and-entertainment/breaking-news-cebu",
    },
    {
      label: "Local Governance",
      href: "/articles/news-and-entertainment/local-governance",
    },
    {
      label: "Festivals & Events",
      href: "/articles/news-and-entertainment/festivals-events",
    },
    {
      label: "Entertainment Buzz",
      href: "/articles/news-and-entertainment/entertainment-buzz",
    },
    {
      label: "Music & Arts",
      href: "/articles/news-and-entertainment/music-arts",
    },
    { label: "Sports", href: "/articles/news-and-entertainment/sports" },
    {
      label: "Campus News",
      href: "/articles/news-and-entertainment/campus-news",
    },
  ],
};

export default function Navbar({
  items = defaultItems,
}: {
  items?: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openHeaderDropdown, setOpenHeaderDropdown] = useState<string | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

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

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenHeaderDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      router.push("/home");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setIsOpen(false);
      setIsLoggingOut(false);
    }
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleHeaderDropdown = (label: string) => {
    setOpenHeaderDropdown(openHeaderDropdown === label ? null : label);
  };

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[var(--custom-orange)] shadow-md">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/home" aria-label="Go to home" title="Home">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-1 border-white flex items-center justify-center">
                <img
                  src="/images/pbb_hd_logo.webp"
                  alt="Proud Bisaya Bai"
                  width={50}
                  height={50}
                  className="h-8 w-8 md:h-10 md:w-10 object-contain cursor-pointer"
                />
              </div>
            </Link>
          </div>

          {/* Categories - visible on all screens */}
          <div className="flex items-center gap-2 flex-wrap flex-1 justify-center">
            {categoryItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                ref={openHeaderDropdown === item.label ? dropdownRef : null}
              >
                {/* Pill container */}
                <div className="flex items-center rounded-full border border-white/50 bg-white/10 px-3 py-1.5 text-xs md:text-sm text-white font-semibold tracking-wide uppercase hover:bg-white/20 transition whitespace-nowrap">
                  {/* Label: hover underline + click to navigate */}
                  <Link
                    href={item.href}
                    title={item.label}
                    className="mr-1 md:mr-2 border-b-2 border-transparent hover:border-white transition-colors"
                  >
                    {item.label}
                  </Link>

                  {/* Arrow: click to toggle dropdown */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHeaderDropdown(item.label);
                    }}
                    aria-label={
                      openHeaderDropdown === item.label
                        ? `Hide ${item.label} subcategories`
                        : `Show ${item.label} subcategories`
                    }
                    className="flex items-center justify-center rounded-full hover:bg-white/20 p-0.5 md:p-1"
                  >
                    <svg
                      className={`h-3 w-3 md:h-4 md:w-4 transition-transform ${
                        openHeaderDropdown === item.label ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Dropdown menu */}
                {subcategories[item.label] &&
                  openHeaderDropdown === item.label && (
                    <div className="absolute left-0 top-full mt-1 z-50 min-w-[220px]">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                        {subcategories[item.label].map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block px-4 py-2 text-sm text-[var(--custom-brown)] hover:bg-[var(--custom-orange)]/10 transition-colors font-medium"
                            title={sub.label}
                            onClick={() => setOpenHeaderDropdown(null)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Search CTA */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              router.push("/articles?focus=search");
            }}
            className="flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-3 py-1.5 text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase hover:bg-white/20 transition flex-shrink-0"
            title="Search articles"
          >
            <svg
              className="h-4 w-4 md:h-5 md:w-5"
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
          </button>

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
              width={35}
              height={35}
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
          backgroundPosition: "center 80%",
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
                  className="w-full inline-flex items-center justify-center rounded-md bg-[var(--custom-red)] text-white text-sm font-semibold px-4 py-2 transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95"
                  onClick={() => setIsOpen(false)}
                >
                  Get Featured
                </Link>
              </div>
              {/* Auth buttons */}
              <div className="px-3 mt-3 space-y-2">
                {session ? (
                  <>
                    <Link
                      href="/admin"
                      title="Admin Dashboard"
                      className="w-full inline-flex items-center justify-center rounded-md bg-[var(--custom-blue)] text-white text-sm font-semibold px-4 py-2 transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      title="Logout"
                      className="w-full inline-flex items-center justify-center rounded-md bg-red-600 text-white text-sm font-semibold px-4 py-2 transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/admin/login"
                    title="Login"
                    className="w-full inline-flex items-center justify-center rounded-md bg-[var(--custom-blue)] text-white text-sm font-semibold px-4 py-2 transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </aside>
    </>
  );
}
