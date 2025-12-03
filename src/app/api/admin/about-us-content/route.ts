import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return createAdminClient();
}

export async function GET() {
  try {
    const supabaseAdmin = await requireAdmin();
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
    if (err instanceof Response) return err;
    console.error("Admin about_us_content GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabaseAdmin = await requireAdmin();
    const body = await request.json();
    const { description } = body;

    if (typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required and must be a string" },
        { status: 400 }
      );
    }

    // Try to update existing record, or insert if none exists
    const { data: existing } = await supabaseAdmin
      .from("about_us_content")
      .select("id")
      .limit(1)
      .single();

    let result;
    if (existing?.id) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from("about_us_content")
        .update({ description, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("id, description, updated_at")
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabaseAdmin
        .from("about_us_content")
        .insert({ description })
        .select("id, description, updated_at")
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin about_us_content PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


