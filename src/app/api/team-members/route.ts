import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
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


