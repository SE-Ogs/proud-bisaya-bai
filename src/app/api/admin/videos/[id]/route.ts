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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.title !== undefined) {
      updates.title = body.title;
    }

    if (body.url !== undefined) {
      updates.url = body.url;
    }

    let platform: VideoPlatform | undefined = body.platform;

    if (body.url && !platform) {
      const detected = detectVideoPlatform(body.url);
      if (!detected) {
        return NextResponse.json(
          { error: "Unable to detect platform from URL" },
          { status: 400 }
        );
      }
      platform = detected;
    }

    if (platform) {
      updates.platform = platform;
    }

    if (body.isActive !== undefined) {
      updates.isActive = Boolean(body.isActive);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("videos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin videos PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = await requireAdmin();
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin videos DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

