import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
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

