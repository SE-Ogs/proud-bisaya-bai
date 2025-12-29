import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    // Use regular client for public access (same as articles)
    const supabase = await createClient();
    
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

