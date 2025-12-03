import React from "react";
import { createClient } from "@/utils/supabase/server";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SubcategoryPageContent from "./SubcategoryPageContent";

type Props = { params: Promise<{ category: string; subcategory: string }> };

const titleize = (slug: string) =>
  slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
/*  */
export default async function SubcategoryPage({ params }: Props) {
  const { category, subcategory } = await params;
  const supabase = await createClient();

  // 1) Build the subcategory chips (prefer name if available; else titleize slug)
  const { data: subcatsRaw, error: subcatErr } = await supabase
    .from("articles")
    .select("subcategory, subcategory_slug")
    .eq("isPublished", true)
    .eq("isArchived", false)
    .eq("category_slug", category);

  const subcatMap = new Map<string, { label: string; slug: string }>();
  (subcatsRaw || []).forEach((row: any) => {
    const slug = row.subcategory_slug;
    const label = row.subcategory?.trim() || (slug ? titleize(slug) : "");
    if (slug && !subcatMap.has(slug)) subcatMap.set(slug, { label, slug });
  });
  const subcategories = Array.from(subcatMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const makeSubcatHref = (slug?: string) =>
    slug ? `/articles/${category}/${slug}` : `/articles/${category}`;

  // 2) Fetch articles for this subcategory
  // Include author; if you have category_name/subcategory_name columns in DB, select them here.
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
    .eq("subcategory_slug", subcategory)
    .order("created_at", { ascending: false });

  // Derive human-friendly names if DB doesn’t have them
  const articlesData =
    (articlesRaw || []).map((a: any) => ({
      ...a,
      category_name: titleize(a.category_slug),
      subcategory_name: titleize(a.subcategory_slug),
    })) || [];

  const title = `${titleize(category)} • ${titleize(subcategory)}`;

  return (
    <div>
      <Header />
      <main className="bg-gray-50 py-12 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          {error && <p className="text-red-600">Failed to load subcategory.</p>}

          {!subcatErr && (
            <SubcategoryPageContent
              articles={articlesData}
              title={title}
              subcategories={subcategories}
              category={category}
              subcategory={subcategory}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
