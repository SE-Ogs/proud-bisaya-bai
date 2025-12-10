import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ArticleRenderer from "@/app/components/ArticleRenderer";
import SuggestedArticlesCarousel from "@/app/components/SuggestedArticlesCarousel";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface ArticlePageParams {
  category: string;
  subcategory: string;
  slug: string;
}

// For Next.js 15 async params support:
interface ArticlePageProps {
  params: Promise<ArticlePageParams> | ArticlePageParams;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // Handle both sync and async params depending on Next version
  const rawParams =
    params instanceof Promise ? await params : (params as ArticlePageParams);

  const category = decodeURIComponent(rawParams.category);
  const subcategory = decodeURIComponent(rawParams.subcategory);
  const slug = decodeURIComponent(rawParams.slug);

  console.log("Decoded params:", { category, subcategory, slug });

  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("category_slug", category)
    .eq("subcategory_slug", subcategory)
    .eq("isPublished", true)
    .eq("isArchived", false)
    .single();

  if (error || !article) {
    console.error("Article not found:", { category, subcategory, slug, error });

    const { data: debugData, error: debugError } = await supabase
      .from("articles")
      .select("category_slug, subcategory_slug, slug")
      .eq("slug", slug)
      .eq("category_slug", category);

    console.log(
      "Debug - Articles with matching category and slug:",
      debugData,
      "debugError:",
      debugError
    );

    return notFound();
  }

  // Fetch latest articles for the carousel (excluding current article)
  const { data: suggestedArticles } = await supabase
    .from("articles")
    .select(
      "id, title, slug, thumbnail_url, created_at, category_slug, subcategory_slug, content, author"
    )
    .eq("isPublished", true)
    .eq("isArchived", false)
    .neq("id", article.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="bg-gray-50 min-h-screen w-full overflow-x-hidden">
      <Header />
      <div className="flex max-w-[1400px] mx-auto px-4 sm:px-6 gap-4 sm:gap-6 bg-gray-50 min-h-screen w-full">
        {/* Left Ad */}
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-gray-200 rounded-lg p-6 xl:p-8 h-[600px] flex items-center justify-center">
            <span className="text-gray-500 font-semibold">Ads Here</span>
          </div>
        </aside>

        {/* Main Article Content */}
        <main className="flex-1 bg-gray-50 rounded-lg p-4 sm:p-6 w-full min-w-0">
          <ArticleRenderer article={article} />
          {suggestedArticles && suggestedArticles.length > 0 && (
            <SuggestedArticlesCarousel
              articles={suggestedArticles}
              currentArticleId={article.id}
            />
          )}
        </main>

        {/* Right Ad */}
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-gray-200 rounded-lg p-6 xl:p-8 h-[600px] flex items-center justify-center">
            <span className="text-gray-500 font-semibold">Ads Here</span>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  const rawParams =
    params instanceof Promise ? await params : (params as ArticlePageParams);

  const category = decodeURIComponent(rawParams.category);
  const subcategory = decodeURIComponent(rawParams.subcategory);
  const slug = decodeURIComponent(rawParams.slug);

  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select(
      // ⬇️ removed `summary` because the column does not exist
      "title, author, category, subcategory, category_slug, subcategory_slug, thumbnail_url"
    )
    .eq("slug", slug)
    .eq("category_slug", category)
    .eq("subcategory_slug", subcategory)
    .eq("isPublished", true)
    .eq("isArchived", false)
    .single();

  if (error || !article) {
    console.error("Metadata article not found:", {
      category,
      subcategory,
      slug,
      error,
    });
    return { title: "Article Not Found" };
  }

  const title = article.title;
  // If you later add `summary` column, you can reintroduce it.
  const description = `By ${article.author}${
    article.category ? ` - ${article.category}` : ""
  }${article.subcategory ? ` / ${article.subcategory}` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: article.thumbnail_url ? [article.thumbnail_url] : [],
      type: "article",
    },
  };
}
