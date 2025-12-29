import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    // Use regular client for public access (same as articles)
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("about_us_content")
      .select("id, description, updated_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found, return empty
        return NextResponse.json({
          id: null,
          description: "",
          updated_at: null,
        });
      }
      throw error;
    }

    return NextResponse.json(data ?? { id: null, description: "", updated_at: null });
  } catch (err: any) {
    console.error("About Us content GET error:", err);
    return NextResponse.json(
      { error: "Failed to load About Us content" },
      { status: 500 }
    );
  }
}







