import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/app/components/Categories';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch ALL articles (including archived and unpublished)
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, author, category, subcategory, created_at, updated_at, thumbnail_url, status, isPublished, isArchived, isEditorsPick, isBreakingNews')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch articles error:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Admin articles GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new article (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, content, author, category, subcategory, thumbnail_url, category_slug, subcategory_slug, reading_time } = body;

    // Validate category and subcategory
    if (!CATEGORIES[category as keyof typeof CATEGORIES]) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    if (subcategory && !CATEGORIES[category as keyof typeof CATEGORIES].includes(subcategory)) {
      return NextResponse.json({ error: 'Invalid subcategory for this category' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        author,
        category,
        subcategory,
        thumbnail_url,
        isPublished: false,
        isArchived: false,
        status: 'Pending',
        category_slug,
        subcategory_slug,
        reading_time,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}