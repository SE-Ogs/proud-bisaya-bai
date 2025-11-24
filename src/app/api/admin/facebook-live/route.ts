import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getFacebookEmbedUrl } from "@/lib/utils/videos";

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("facebook_live")
    .select("fb_url, fb_embed_url, is_active")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET /api/admin/facebook-live error", error);
    return NextResponse.json(
      { error: "Failed to load Facebook Live settings" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    data || {
      fb_url: "",
      fb_embed_url: "",
      is_active: false,
    }
  );
}

export async function PUT(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fb_url = typeof body.fb_url === "string" ? body.fb_url.trim() : "";
  const is_active = Boolean(body.is_active);

  if (!fb_url) {
    return NextResponse.json({ error: "fb_url is required" }, { status: 400 });
  }

  const fb_embed_url = getFacebookEmbedUrl(fb_url);

  const supabase = createAdminClient();

  const FACEBOOK_LIVE_ID = "00000000-0000-0000-0000-000000000001";

  const { data, error } = await supabase
    .from("facebook_live")
    .upsert(
      {
        id: FACEBOOK_LIVE_ID,
        fb_url,
        fb_embed_url,
        is_active,
      },
      { onConflict: "id" }
    )
    .select("fb_url, fb_embed_url, is_active")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("PUT /api/admin/facebook-live error", error);
    return NextResponse.json(
      { error: "Failed to save Facebook Live settings" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}