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
      .from("team_members")
      .select("id, photo_url, name, company_title, display_order, created_at, updated_at")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("Team members GET error:", err);
    return NextResponse.json(
      { error: "Failed to load team members" },
      { status: 500 }
    );
  }
}







