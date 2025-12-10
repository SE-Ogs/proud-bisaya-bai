import React from "react";
import { NavigationLink as Link } from "@/app/components/NavigationLink";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import LatestUpdateCard from "@/app/components/LatestUpdateCard";
import VideoCarousel from "@/app/components/VideoCarousel";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import BreakingNewsCarousel from "../components/BreakingNewsCarousel";
import PartnersCarousel from "../components/PartnersCarousel";

const Home: React.FC = async () => {
  const stories = [
    {
      title: "Destinations",
      image: "/images/destinations_image.webp",
      slug: "destinations",
    },
    {
      title: "News and Entertainment",
      image: "/images/news_image.webp",
      slug: "news-and-entertainment",
    },
    { title: "Food", image: "/images/food_image.webp", slug: "food" },
    {
      title: "Brands and Products",
      image: "/images/brands_image.webp",
      slug: "brands-and-products",
    },
    { title: "Stories", image: "/images/stories_image.webp", slug: "stories" },
  ];

  const supabase = await createClient();

  // Run all queries in parallel - ADDED hero_banner query
  const [
    { data: articlesDataRaw, error: articlesErr },
    { data: breakingNewsDataRaw, error: breakingErr },
    { data: editorsPicksDataRaw, error: editorsErr },
    { data: newsEntertainmentDataRaw, error: newsErr },
    { data: heroBannerDataRaw, error: heroBannerErr }, // NEW: Fetch hero banner
  ] = await Promise.all([
    // All Articles (for the grid)
    supabase
      .from("articles")
      .select(
        "title, slug, thumbnail_url, created_at, author, category_slug, subcategory_slug, reading_time"
      )
      .eq("isPublished", true)
      .eq("isArchived", false)
      .order("created_at", { ascending: false })
      .limit(8),

    // Breaking News: at most ten
    supabase
      .from("articles")
      .select(
        "title, slug, created_at, author, category_slug, subcategory_slug, thumbnail_url, reading_time"
      )
      .eq("isPublished", true)
      .eq("isArchived", false)
      .eq("isBreakingNews", true)
      .order("created_at", { ascending: false })
      .limit(10),

    // Editor's Picks: up to 3
    supabase
      .from("articles")
      .select(
        "title, slug, thumbnail_url, created_at, author, category_slug, subcategory_slug, reading_time"
      )
      .eq("isPublished", true)
      .eq("isArchived", false)
      .eq("isEditorsPick", true)
      .order("created_at", { ascending: false })
      .limit(3),

    // Latest News and Entertainment: only category_slug = "news-and-entertainment"
    supabase
      .from("articles")
      .select(
        "title, slug, thumbnail_url, created_at, author, category_slug, subcategory_slug, reading_time"
      )
      .eq("isPublished", true)
      .eq("isArchived", false)
      .eq("category_slug", "news-and-entertainment")
      .order("created_at", { ascending: false })
      .limit(3),

    // NEW: Hero Banner - fetch active banner
    supabase
      .from("hero_banner")
      .select("image_url, subtitle")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  // Optional: basic error logging (server console)
  if (articlesErr) console.error("All articles query failed:", articlesErr);
  if (breakingErr) console.error("Breaking news query failed:", breakingErr);
  if (editorsErr) console.error("Editors picks query failed:", editorsErr);
  if (newsErr) console.error("News & Entertainment query failed:", newsErr);
  if (heroBannerErr) console.error("Hero banner query failed:", heroBannerErr); // NEW: Log error

  // Fetch partners using admin client (similar to videos)
  let partnersDataRaw: any[] = [];
  let partnersErr: any = null;
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("partners")
      .select("id, name, description, image_url, url, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      partnersErr = error;
    } else {
      partnersDataRaw = data ?? [];
    }
  } catch (err) {
    partnersErr = err;
  }
  if (partnersErr) console.error("Partners query failed:", partnersErr);

  let videosDataRaw: any[] = [];
  let videosErr: any = null;
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("id, title, url, platform, thumbnail_url, isFeatured, created_at")
      .eq("isFeatured", true)
      .order("created_at", { ascending: false });
    if (error) {
      videosErr = error;
    } else {
      videosDataRaw = data ?? [];
    }
  } catch (err) {
    videosErr = err;
  }
  if (videosErr) console.error("Videos query failed:", videosErr);

  let facebookLive: {
    fb_url: string;
    fb_embed_url: string;
    is_active: boolean;
  } | null = null;
  let facebookLiveErr: any = null;

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("facebook_live")
      .select("fb_url, fb_embed_url, is_active")
      .limit(1)
      .maybeSingle();

    if (error) {
      facebookLiveErr = error;
    } else {
      facebookLive = data as any;
    }
  } catch (err) {
    facebookLiveErr = err;
  }
  if (facebookLiveErr)
    console.error("Facebook Live query failed:", facebookLiveErr);

  // Null-safe fallbacks
  const articlesData = articlesDataRaw ?? [];
  const breakingNews = breakingNewsDataRaw ?? [];
  const editorsPicksData = editorsPicksDataRaw ?? [];
  const newsEntertainmentData = newsEntertainmentDataRaw ?? [];
  const videosData = (videosDataRaw ?? [])
    .map((video) => ({
      ...video,
      platform: (video.platform || "").toLowerCase(),
    }))
    .filter((video) =>
      ["youtube", "facebook", "tiktok"].includes(video.platform)
    );

  // NEW: Get hero banner image with fallback to default
  const heroBannerImageUrl =
    heroBannerDataRaw?.image_url || "/images/banner.webp";
  const heroSubtitle =
    heroBannerDataRaw?.subtitle ||
    "Your daily guide to the best of Central Visayas.";

  // NEW: Process partners data
  const partnersData = partnersDataRaw ?? [];

  return (
    <div className="w-full overflow-x-hidden">
      <main className="w-full overflow-x-hidden">
        {/* Header */}
        <Header />

        {/* Hero Banner - UPDATED: Now uses dynamic image from database */}
        <div
          className="relative h-[60vh] sm:h-[70vh] md:h-screen bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBannerImageUrl}')` }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-[var(--custom-orange)] to-[var(--custom-orange)] bg-clip-text text-transparent leading-tight px-2">
              Proud Bisaya Bai
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl max-w-2xl px-2">
              {heroSubtitle}
            </p>
            <Link href="/contact-us">
              <button className="mt-6 px-5 py-2.5 sm:px-6 sm:py-3 bg-[var(--custom-red)] text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95">
                Get Featured
              </button>
            </Link>
          </div>
        </div>

        {/* Breaking News */}
        <section className="bg-white py-6 sm:py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-3 mb-5">
              {/* Pulsing red dot */}
              <div className="relative h-4 w-4 sm:h-5 sm:w-5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: "var(--custom-red)" }}
                />
                <span
                  className="relative inline-flex h-full w-full rounded-full"
                  style={{ backgroundColor: "var(--custom-red)" }}
                />
              </div>

              <h2
                className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight"
                style={{ color: "var(--custom-red)" }}
              >
                Breaking News
              </h2>
            </div>

            {breakingNews.length > 0 ? (
              <BreakingNewsCarousel newsItems={breakingNews} />
            ) : (
              <div className="bg-gray-100 p-8 rounded-lg text-gray-500 text-center border-2 border-dashed border-gray-300">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <p className="font-semibold">No breaking news at the moment.</p>
                <p className="text-sm mt-1">Check back soon for updates</p>
              </div>
            )}
          </div>
        </section>

        {/* Videos Section */}
        {videosData.length > 0 && (
          <section className="bg-[var(--custom-blue)] py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center text-white">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[var(--custom-orange)]">
                  Videos
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
                  Watch the Latest Highlights
                </h3>
                <div className="h-1.5 w-16 bg-[var(--custom-orange)] rounded-full my-2 mb-4 mx-auto" />
                <p className="mt-3 text-white/70 max-w-2xl mx-auto">
                  Straight from Facebook, Youtube, and TikTok - curated stories,
                  interviews, and moments from Proud Bisaya Bai.
                </p>
              </div>

              <div className="mt-10">
                <VideoCarousel
                  videos={videosData.map((video) => ({
                    id: video.id,
                    title: video.title,
                    url: video.url,
                    platform: video.platform as
                      | "youtube"
                      | "facebook"
                      | "tiktok",
                    created_at: video.created_at,
                    thumbnail_url: video.thumbnail_url,
                  }))}
                />
              </div>
            </div>
          </section>
        )}

        {/* Facebook Live Section (controlled from admin) */}
        {facebookLive &&
          facebookLive.is_active &&
          facebookLive.fb_embed_url && (
            <section className="bg-[var(--custom-blue)] py-8 sm:py-12">
              <div className="text-center container mx-auto px-4 sm:px-6">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                    Watch Us Live!
                  </h3>
                  <div className="h-1.5 w-16 bg-[var(--custom-orange)] rounded-full mb-4 mx-auto" />
                </div>
                <div className="max-w-3xl mx-auto">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src={facebookLive.fb_embed_url}
                      className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                      style={{ border: "none", overflow: "hidden" }}
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    ></iframe>
                  </div>
                  <p className="mt-4 text-center text-white text-sm">
                    Join us live on Facebook for the latest updates and
                    exclusive content!
                  </p>
                </div>
              </div>
            </section>
          )}

        {/* Featured Stories */}
        <section className="bg-white py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black tracking-tight mb-5 flex items-center justify-center gap-3">
                <span className="inline-block w-1.5 h-5 sm:h-6 md:h-7 rounded-full bg-[var(--custom-orange)]" />
                Featured Stories
              </h3>
            </div>

            {/* Desktop: 12-col grid -> [2 cols ad] [8 cols content] [2 cols ad] */}
            {/* Mobile: ads shown above and below content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Left Ad - Desktop only */}
              <aside className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24">
                  <div className="w-full h-[450px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">ADS</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-8">
                {/* Mobile Ad - Above content */}
                <div className="lg:hidden mb-4">
                  <div className="w-full h-[100px] sm:h-[120px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">
                      ADS
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {stories.map((story, index) => (
                    <Link
                      key={index}
                      href={`/articles/${story.slug}`}
                      className="relative h-40 bg-cover bg-center rounded-lg shadow-lg group block"
                      style={{ backgroundImage: `url(${story.image})` }}
                    >
                      <span className="absolute inset-0 bg-black/40 rounded-lg group-hover:bg-black/60 transition-colors" />
                      <span className="relative z-10 flex h-full items-center justify-center">
                        <h3 className="text-white text-xl font-semibold">
                          {story.title}
                        </h3>
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Ad - Below content */}
                <div className="lg:hidden mt-4">
                  <div className="w-full h-[100px] sm:h-[120px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">
                      ADS
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </div>

              {/* Right Ad - Desktop only */}
              <aside className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24">
                  <div className="w-full h-[450px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">ADS</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* All Articles */}
        <section
          className="py-8 sm:py-12"
          style={{ backgroundColor: "var(--custom-blue)" }}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-5 flex items-center justify-center gap-3">
                <span className="inline-block w-1.5 h-5 sm:h-6 md:h-7 rounded-full bg-[var(--custom-orange)]" />
                All Articles
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {articlesData.slice(0, 4).map((article) => {
                const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;
                return (
                  <Link
                    key={article.slug}
                    href={href}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 flex flex-col h-[380px] sm:h-[420px]"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <img
                        src={article.thumbnail_url || "/images/banner.webp"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Reading time badge */}
                      {article.reading_time && (
                        <div className="absolute top-3 right-3 bg-gray-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-white font-semibold text-sm">
                              {article.reading_time} min
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Title */}
                      <h4 className="text-lg font-bold line-clamp-3 text-gray-900 mb-3 group-hover:text-[var(--custom-orange)] transition-colors duration-200 leading-snug">
                        {article.title}
                      </h4>

                      {/* Spacer */}
                      <div className="flex-1"></div>

                      {/* Meta Information */}
                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        {/* Date and Time with icon */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 flex-shrink-0 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">
                            {new Date(article.created_at).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">
                            {new Date(article.created_at).toLocaleTimeString(
                              "en-PH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Manila",
                              }
                            )}
                          </span>
                        </div>

                        {/* Author with icon */}
                        {article.author && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 flex-shrink-0 text-gray-400"
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
                              By{" "}
                              <span className="font-medium text-gray-800">
                                {article.author}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* See All Articles Link */}
            <div className="mt-12 text-center">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
              >
                <span>See all articles</span>
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            {/* Ad block */}
            <div className="mt-12">
              <div className="w-full h-[160px] bg-white/90 border-2 border-white/70 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <span className="text-gray-800 font-semibold text-lg">ADS</span>
              </div>
              {/* Caption */}
              <p className="mt-3 text-sm text-white/90 text-center font-medium">
                Sponsored by _____
              </p>
            </div>
          </div>
        </section>

        {/* Latest News and Entertainment + Editor's Picks with side ads */}
        <section className="py-6 sm:py-8" style={{ backgroundColor: "white" }}>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Left Ad (desktop only) */}
              <aside className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24">
                  <div className="w-full h-[750px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">ADS</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </aside>

              {/* Main content (2 columns inside) */}
              <div className="lg:col-span-8">
                {/* Mobile Ad - Above content */}
                <div className="lg:hidden mb-6">
                  <div className="w-full h-[100px] sm:h-[120px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">
                      ADS
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Latest News and Entertainment */}
                  <div className="flex flex-col">
                    {/* Header with fixed height so columns align */}
                    <div className="min-h-[88px] flex flex-col justify-end mb-2">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                        Karon: Latest News and Entertainment
                      </h3>
                      <div className="h-1.5 w-16 bg-[var(--custom-orange)] rounded-full mt-2" />
                    </div>

                    {/* Cards stack */}
                    <div className="flex flex-col gap-6">
                      {newsEntertainmentData.length === 0 ? (
                        <p className="text-sm text-white/90">
                          No News and Entertainment articles found.
                        </p>
                      ) : (
                        newsEntertainmentData.map((article, index) => {
                          const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;
                          return (
                            <Link key={index} href={href} className="block">
                              <LatestUpdateCard
                                image={
                                  article.thumbnail_url ||
                                  "/images/articles.webp"
                                }
                                title={article.title}
                                createdAt={article.created_at}
                                author={article.author}
                                reading_time={article.reading_time}
                              />
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Editor's Picks */}
                  <div className="flex flex-col">
                    {/* Header with the SAME fixed height */}
                    <div className="min-h-[88px] flex flex-col justify-end mb-2">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                        Editor&apos;s Picks
                      </h3>
                      <div className="h-1.5 w-16 bg-[var(--custom-orange)] rounded-full mt-2" />
                    </div>

                    {/* Cards stack */}
                    <div className="flex flex-col gap-6">
                      {editorsPicksData.length === 0 ? (
                        <h3 className="text-sm mb-4 text-white/80">
                          No articles found.
                        </h3>
                      ) : (
                        editorsPicksData.map((article, index) => {
                          const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;
                          return (
                            <Link key={index} href={href} className="block">
                              <LatestUpdateCard
                                image={
                                  article.thumbnail_url ||
                                  "/images/articles.webp"
                                }
                                title={article.title}
                                createdAt={article.created_at}
                                author={article.author}
                                reading_time={article.reading_time}
                              />
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Ad - Below content */}
                <div className="lg:hidden mt-6">
                  <div className="w-full h-[100px] sm:h-[120px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">
                      ADS
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </div>

              {/* Right Ad (desktop only) */}
              <aside className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24">
                  <div className="w-full h-[750px] bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">ADS</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gray-200 my-8"></div>

        {/* Our Partners Section */}
        <section className="bg-white py-6 sm:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            {/* SECTION HEADER */}
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-6 sm:h-8 md:h-9 rounded-full bg-[var(--custom-orange)]" />
                Our Partners
              </h3>
            </div>

            {/* PARTNERS */}
            <PartnersCarousel partners={partnersData} />
          </div>
        </section>

        {/* Ads Section */}
        <section className="bg-white py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mt-4">
              <div className="w-full h-[160px] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-gray-700 font-semibold">ADS</span>
              </div>
              {/* Caption */}
              <p className="mt-2 text-xs text-gray-500 text-center">
                Sponsored by _____
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default Home;
