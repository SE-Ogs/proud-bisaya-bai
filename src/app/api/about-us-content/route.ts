import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
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


