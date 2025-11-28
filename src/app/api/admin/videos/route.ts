import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  detectVideoPlatform,
  VideoPlatform,
} from "@/lib/utils/videos";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return createAdminClient();
}

export async function GET() {
  try {
    const supabaseAdmin = await requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("id, title, url, platform, thumbnail_url, isFeatured, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin videos GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = await requireAdmin();
    const body = await request.json();
    const { title, url, platform, isFeatured = false, thumbnail_url } = body;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    const resolvedPlatform: VideoPlatform | null =
      platform || detectVideoPlatform(url);

    if (!resolvedPlatform) {
      return NextResponse.json(
        { error: "Unable to detect platform from URL" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("videos")
      .insert({
        title: title.trim(),
        url: url.trim(),
        platform: resolvedPlatform,
        thumbnail_url: thumbnail_url?.trim() || null,
        isFeatured: Boolean(isFeatured),
      })
    .select()
    .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin videos POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

