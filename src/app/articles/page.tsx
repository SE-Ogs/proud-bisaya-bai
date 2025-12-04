// app/articles/page.tsx or wherever this file lives
import { createClient } from "@/utils/supabase/server";
import ArticlesPageContent from "./ArticlesPageContent";
import { CATEGORIES_CONFIG } from "@/lib/config/categories";

export default async function ArticlesIndexPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select(
      "id, title, author, created_at, category, subcategory, slug, thumbnail_url, category_slug, subcategory_slug, reading_time"
    )
    .eq("isPublished", true)
    .eq("isArchived", false)
    .order("created_at", { ascending: false });

  const safeArticles = articles || [];

  // Deep clone so we can safely mutate counts
  const categories = CATEGORIES_CONFIG.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories.map((sub) => ({ ...sub })),
  }));

  // Category counts
  categories.forEach((category) => {
    category.count =
      safeArticles.filter((a) => a.category_slug === category.slug).length || 0;
  });

  // Subcategory counts
  categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.count =
        safeArticles.filter(
          (a) =>
            a.category_slug === category.slug &&
            a.subcategory_slug === subcategory.slug
        ).length || 0;
    });
  });

  return (
    <ArticlesPageContent articles={safeArticles} categories={categories} />
  );
}
