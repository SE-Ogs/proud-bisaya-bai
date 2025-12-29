import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    // Use regular client for public access (same as articles)
    const supabase = await createClient();
    
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







