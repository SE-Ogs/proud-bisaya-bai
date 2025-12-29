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

    if (error) {
      console.error("Partners query error:", error);
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: "Failed to load partners",
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("Partners GET error:", err);
    return NextResponse.json(
      { 
        error: "Failed to load partners",
        details: err.message || err.toString()
      },
      { status: 500 }
    );
  }
}

