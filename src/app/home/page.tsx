import Head from "next/head";
import React from "react";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import LatestUpdateCard from "@/app/components/LatestUpdateCard";
import { createClient } from "@/utils/supabase/server";

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

  // Run all queries in parallel
  const [
    { data: articlesDataRaw, error: articlesErr },
    { data: breakingNewsDataRaw, error: breakingErr },
    { data: editorsPicksDataRaw, error: editorsErr },
    { data: newsEntertainmentDataRaw, error: newsErr },
  ] = await Promise.all([
    // All Articles (for the grid)
    supabase
      .from("articles")
      .select(
        "title, slug, thumbnail_url, created_at, author, category_slug, subcategory_slug"
      )
      .eq("isPublished", true)
      .eq("isArchived", false)
      .order("created_at", { ascending: false })
      .limit(8),

    // Breaking News: at most one
    supabase
      .from("articles")
      .select(
        "title, slug, created_at, category_slug, subcategory_slug, thumbnail_url"
      )
      .eq("isPublished", true)
      .eq("isArchived", false)
      .eq("isBreakingNews", true)
      .order("created_at", { ascending: false })
      .limit(1),

    // Editor's Picks: up to 3
    supabase
      .from("articles")
      .select(
        "title, slug, thumbnail_url, created_at, author, category_slug, subcategory_slug"
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
        "title, slug, thumbnail_url, created_at, author, category_slug, subcategory_slug"
      )
      .eq("isPublished", true)
      .eq("isArchived", false)
      .eq("category_slug", "news-and-entertainment")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  // Optional: basic error logging (server console)
  if (articlesErr) console.error("All articles query failed:", articlesErr);
  if (breakingErr) console.error("Breaking news query failed:", breakingErr);
  if (editorsErr) console.error("Editors picks query failed:", editorsErr);
  if (newsErr) console.error("News & Entertainment query failed:", newsErr);

  // Null-safe fallbacks
  const articlesData = articlesDataRaw ?? [];
  const breakingNews = (breakingNewsDataRaw ?? [])[0] ?? null;
  const editorsPicksData = editorsPicksDataRaw ?? [];
  const newsEntertainmentData = newsEntertainmentDataRaw ?? [];

  return (
    <div>
      <Head>
        <title>Proud Bisaya Bai</title>
        <meta
          name="description"
          content="Your daily guide to the best of Central Visayas."
        />
      </Head>

      <main>
        {/* Header */}
        <Header />

        {/* Hero Banner */}
        <div
          className="relative h-screen bg-cover bg-center"
          style={{ backgroundImage: "url('/images/banner.webp')" }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
            <h1 className="text-9xl md:text-10xl font-bold bg-gradient-to-r from-[var(--custom-orange)] to-[var(--custom-orange)] bg-clip-text text-transparent leading-tight">
              Proud Bisaya Bai
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl">
              Your daily guide to the best of Central Visayas. Discover
              authentic Bisaya food, travel routes, and stories from Cebu and
              beyond.
            </p>
            <Link href="/contact-us">
              <button className="mt-6 px-6 py-3 bg-[var(--custom-red)] text-white font-semibold rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95">
                Get Featured
              </button>
            </Link>
          </div>
        </div>

        {/* Facebook Live Section */}
        {/* Comment out if not used :D */}
        <section className="bg-[var(--custom-blue)] py-12">
          <div className="text-center container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                Watch Us Live!
              </h3>
              <div className="h-1.5 w-16 bg-[var(--custom-orange)] rounded-full mb-4 mx-auto" />
            </div>
            <div className="max-w-3xl mx-auto">
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%" }}
              >
                {/* three dots (•••) in the top-right corner of the video post then select embed for proper link */}
                <iframe
                  src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FSparta%2Fvideos%2F680780428062150%2F&show_text=false&width=560&t=0"
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  style={{ border: "none", overflow: "hidden" }}
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
              <p className="mt-4 text-center text-white text-sm">
                Join us live on Facebook for the latest updates and exclusive
                content!
              </p>
            </div>
          </div>
        </section>

        {/* Featured Stories */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mb-5 flex items-center justify-center gap-3">
                <span className="inline-block w-1.5 h-6 md:h-7 rounded-full bg-[var(--custom-orange)]" />
                Featured Stories
              </h3>
            </div>

            {/* Desktop: 12-col grid -> [2 cols ad] [8 cols content] [2 cols ad] */}
            {/* Mobile/Tablet: 1 col -> only content (ads hidden) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Ad */}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>

              {/* Right Ad */}
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
          className="py-12"
          style={{ backgroundColor: "var(--custom-blue)" }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-5 flex items-center justify-center gap-3">
                <span className="inline-block w-1.5 h-6 md:h-7 rounded-full bg-[var(--custom-orange)]" />
                All Articles
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articlesData.slice(0, 4).map((article) => {
                const href = `/articles/${article.category_slug}/${article.subcategory_slug}/${article.slug}`;
                return (
                  <Link
                    key={article.slug}
                    href={href}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 flex flex-col h-[420px]"
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
                        {/* Date with icon */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 flex-shrink-0 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
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

        {/* Breaking News */}
        <section className="bg-white py-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-5">
              {/* Pulsing red dot */}
              <div className="relative h-5 w-5">
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
                className="text-2xl md:text-3xl font-extrabold tracking-tight"
                style={{ color: "var(--custom-red)" }}
              >
                Breaking News
              </h2>
            </div>

            {breakingNews ? (
              <Link
                href={`/articles/${breakingNews.category_slug}/${breakingNews.subcategory_slug}/${breakingNews.slug}`}
                className="block rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-4 overflow-hidden group"
                style={{ borderColor: "var(--custom-red)" }}
              >
                {/* Image Section */}
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={breakingNews.thumbnail_url || "/images/banner.webp"}
                    alt={breakingNews.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* LIVE badge - positioned on image */}
                  {/* <div className="absolute top-4 left-4">
                    <span
                      className="inline-flex items-center gap-2 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg uppercase"
                      style={{ backgroundColor: "var(--custom-red)" }}
                    >
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      Live
                    </span>
                  </div> */}

                  {/* Time badge - positioned on image */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-white font-bold text-lg">
                      {new Date(breakingNews.created_at).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                    <p className="text-white/90 text-xs text-center">
                      {new Date(breakingNews.created_at).toLocaleDateString(
                        [],
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Content Section */}
                <div
                  className="p-6"
                  style={{ backgroundColor: "var(--custom-red)" }}
                >
                  <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight">
                    {breakingNews.title}
                  </h3>
                  <p className="text-white/90 text-sm mt-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {(() => {
                      const now = new Date();
                      const postDate = new Date(breakingNews.created_at);
                      const diffMs = now.getTime() - postDate.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);

                      if (diffMins < 1) return "Just now";
                      if (diffMins < 60)
                        return `${diffMins} minute${
                          diffMins > 1 ? "s" : ""
                        } ago`;
                      if (diffHours < 24)
                        return `${diffHours} hour${
                          diffHours > 1 ? "s" : ""
                        } ago`;
                      if (diffDays === 1) return "1 day ago";
                      return `${diffDays} days ago`;
                    })()}
                    {" • Click to read full story"}
                  </p>
                </div>
              </Link>
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

        {/* Latest News and Entertainment + Editor's Picks with side ads */}
        <section
          className="py-8"
          style={{ backgroundColor: "var(--custom-blue)" }}
        >
          <div className="max-w-screen-xl mx-auto px-4 lg:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Ad (desktop only) */}
              <aside className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24">
                  <div className="w-full h-[750px] bg-white/85 border border-white/70 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-gray-800 font-semibold">ADS</span>
                  </div>
                  <p className="mt-2 text-xs text-white/90 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </aside>

              {/* Main content (2 columns inside) */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Latest News and Entertainment */}
                  <div className="flex flex-col">
                    {/* Header with fixed height so columns align */}
                    <div className="min-h-[88px] flex flex-col justify-end mb-2">
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
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
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
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
                              />
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Ad (desktop only) */}
              <aside className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24">
                  <div className="w-full h-[750px] bg-white/85 border border-white/70 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-gray-800 font-semibold">ADS</span>
                  </div>
                  <p className="mt-2 text-xs text-white/90 text-center">
                    Sponsored by _____
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Our Partners Section */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-6 text-center">
            {/* SECTION HEADER */}
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight flex items-center justify-center gap-2">
                <span className="inline-block w-1.5 h-6 md:h-7 rounded-full bg-[var(--custom-orange)]" />
                Our Partners
              </h3>
            </div>

            {/* PARTNERS */}
            <div className="flex flex-wrap justify-center gap-12">
              {/* Partner 1 */}
              <a
                href="https://cebuhomepages.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center max-w-[180px] transition-transform transform hover:scale-105"
              >
                <div className="w-28 h-28 flex items-center justify-center bg-white shadow-md rounded-full p-4 hover:shadow-lg">
                  <img
                    src="/images/cebuhomepages.webp"
                    alt="Cebu Home Pages Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-3">
                  Cebu Home Pages
                </p>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Helping Home Buyers and Investors Since 2011
                </p>
              </a>

              {/* Partner 2 */}
              <a
                href="https://www.lalamove.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center max-w-[180px] transition-transform transform hover:scale-105"
              >
                <div className="w-28 h-28 flex items-center justify-center bg-white shadow-md rounded-full overflow-hidden hover:shadow-lg">
                  <img
                    src="/images/lalamove.webp"
                    alt="Lalamove Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-3">
                  Lalamove
                </p>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Leading same‑day delivery app and courier service
                </p>
              </a>

              {/* Partner 3 */}
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center max-w-[180px] transition-transform transform hover:scale-105"
              >
                <div className="w-28 h-28 flex items-center justify-center bg-white shadow-md rounded-full p-4 hover:shadow-lg">
                  <img
                    src="/images/jse.webp"
                    alt="JSE Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-3">JSE</p>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Empowering digital brands through creative innovation
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Ads Section */}
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4">
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
