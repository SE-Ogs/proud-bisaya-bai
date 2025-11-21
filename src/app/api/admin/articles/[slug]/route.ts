import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/app/components/Categories';

// GET single article by slug (admin only)
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
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
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      );
    }

    // Fetch single article by slug (including all fields for editing)
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Fetch article error:', error);
      
      // Handle "not found" error specifically
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Article not found' }, 
          { status: 404 }
        );
      }
      
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin article GET error:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}

// PUT update article (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
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
    const { title, slug: newSlug, content, author, category, subcategory, thumbnail_url, category_slug, subcategory_slug } = body;

    // Validate category and subcategory if provided
    if (category && !CATEGORIES[category as keyof typeof CATEGORIES]) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (subcategory && category && !CATEGORIES[category as keyof typeof CATEGORIES].includes(subcategory)) {
      return NextResponse.json({ error: 'Invalid subcategory for this category' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('articles')
      .update({
        title,
        slug: newSlug,
        content,
        author,
        category,
        subcategory,
        thumbnail_url,
        updated_at: new Date().toISOString(),
        category_slug,
        subcategory_slug
      })
      .eq('slug', params.slug)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE article (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('slug', params.slug);

    if (error) throw error;

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}