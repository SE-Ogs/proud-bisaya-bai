import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    // Try admin client first (if service role key is available)
    // Fall back to regular client for public access
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      // If admin client fails (missing service role key), use regular client
      supabase = await createClient();
    }

    const { data, error } = await supabase
      .from("partners")
      .select("id, name, description, image_url, url, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("Partners GET error:", err);
    return NextResponse.json(
      { error: "Failed to load partners" },
      { status: 500 }
    );
  }
}

