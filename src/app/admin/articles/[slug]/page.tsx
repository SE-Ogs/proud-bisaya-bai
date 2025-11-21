import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/app/components/AdminHeader';
import ArticleRenderer from '@/app/components/ArticleRenderer';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function AdminArticleView({ params }: PageProps) {
  const supabase = await createClient();

  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/unauthorized');

  // Fetch the article using your existing admin API route
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!article) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Admin Header with Controls */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/admin/dashboard" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex gap-2">
            {!article.isPublished && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                Unpublished
              </span>
            )}
            {article.isArchived && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                Archived
              </span>
            )}
            {article.isBreakingNews && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                Breaking News
              </span>
            )}
            {article.isEditorsPick && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                Editor's Pick
              </span>
            )}
          </div>
        </div>

        {/* Article Content using your existing ArticleRenderer */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ArticleRenderer article={article} />
        </div>

        {/* Admin Actions Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex gap-4 justify-center">
            <Link
              href={`/admin/articles/${article.slug}/metadata`}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 font-medium"
            >
              Edit Metadata
            </Link>
            <Link
              href={`/admin/articles/${article.slug}/content`}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium"
            >
              Edit Content
            </Link>
            <Link
              href="/admin/dashboard"
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}