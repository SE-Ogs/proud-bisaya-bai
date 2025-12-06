import React from "react";
import { createClient } from "@/utils/supabase/server";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CategoryPageContent from "./CategoryPageContent";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ subcategory?: string }>;
};

const titleize = (slug: string) =>
  slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

export default async function CategoryIndex({ params, searchParams }: Props) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const activeSubcategory = resolvedSearchParams?.subcategory;

  const supabase = await createClient();

  // Get subcategories (use names if available)
  const { data: subcatsRaw, error: subcatErr } = await supabase
    .from("articles")
    .select("subcategory, subcategory_slug")
    .eq("isPublished", true)
    .eq("isArchived", false)
    .eq("category_slug", category);

  const subcatMap = new Map<string, { label: string; slug: string }>();
  (subcatsRaw || []).forEach((row: any) => {
    const slug = row.subcategory_slug;
    // prefer row.subcategory if it exists; else titleize the slug
    const label = row.subcategory?.trim() || (slug ? titleize(slug) : "");
    if (slug && !subcatMap.has(slug)) subcatMap.set(slug, { label, slug });
  });
  const subcategories = Array.from(subcatMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  // Get ALL articles in this category
  const { data: articlesRaw, error } = await supabase
    .from("articles")
    .select(
      `
      title,
      slug,
      thumbnail_url,
      created_at,
      category_slug,
      subcategory_slug,
      author
    `
    )
    .eq("isPublished", true)
    .eq("isArchived", false)
    .eq("category_slug", category)
    .order("created_at", { ascending: false });

  // Derive human-friendly names for category/subcategory if DB doesn’t have them
  const articlesData =
    (articlesRaw || []).map((a: any) => ({
      ...a,
      category_name: titleize(a.category_slug),
      subcategory_name: titleize(a.subcategory_slug),
    })) || [];

  const categoryTitle = titleize(category);
  const makeSubcatHref = (slug?: string) =>
    slug ? `/articles/${category}/${slug}` : `/articles/${category}`;

  return (
    <div>
      <Header />
      <main className="bg-gray-50 py-12 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          {error && (
            <p className="text-red-600 mb-6">Failed to load articles.</p>
          )}

          {!subcatErr && (
            <CategoryPageContent
              articles={articlesData}
              categoryTitle={categoryTitle}
              subcategories={subcategories}
              category={category}
              activeSubcategory={activeSubcategory}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
