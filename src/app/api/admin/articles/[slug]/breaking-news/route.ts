import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const supabase = await createClient();

        // Admin authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { isBreakingNews } = body;

        if (typeof isBreakingNews !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { data: article, error: articleError } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .single();

        if (articleError || !article) {
            console.error('Article fetch error:', articleError);
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        if (!article.isPublished) {
            return NextResponse.json({
                error: 'Only published articles can be set as breaking news'
            }, { status: 400 });
        }

        if (isBreakingNews) {
            // Set current article as breaking news
            const { data, error: setError } = await supabase
                .from('articles')
                .update({
                    isBreakingNews: true,
                    updated_at: new Date().toISOString()
                })
                .eq('slug', slug)
                .select()
                .single();

            if (setError) {
                console.error('Set breaking news error:', setError);
                return NextResponse.json({
                    error: 'Failed to set breaking news'
                }, { status: 500 });
            }

            return NextResponse.json(data);
        } else {
            // When removing breaking news
            const { data, error: setError } = await supabase
                .from('articles')
                .update({
                    isBreakingNews: false,
                    updated_at: new Date().toISOString()
                })
                .eq('slug', slug)
                .select()
                .single();

            if (setError) {
                console.error('Remove breaking news error:', setError);
                return NextResponse.json({
                    error: 'Failed to update breaking news'
                }, { status: 500 });
            }

            return NextResponse.json(data);
        }
    } catch (error: any) {
        console.error('Breaking news route error:', error);
        return NextResponse.json({
            error: 'Internal Server Error: ' + error.message
        }, { status: 500 });
    }
}