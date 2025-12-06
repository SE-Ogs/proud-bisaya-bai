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
      .from("team_members")
      .select("id, photo_url, name, company_title, display_order, created_at, updated_at")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin team_members GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = await requireAdmin();
    const body = await request.json();
    const { photo_url, name, company_title, display_order } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required and must be a string" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("team_members")
      .insert({
        photo_url: photo_url?.trim() || "",
        name: name.trim(),
        company_title: company_title?.trim() || "",
        display_order: display_order ?? 0,
      })
      .select("id, photo_url, name, company_title, display_order, created_at, updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin team_members POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabaseAdmin = await requireAdmin();
    const body = await request.json();
    const { id, photo_url, name, company_title, display_order } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required and must be a string" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: name.trim(),
      updated_at: new Date().toISOString(),
    };

    if (photo_url !== undefined) updateData.photo_url = photo_url?.trim() || "";
    if (company_title !== undefined) updateData.company_title = company_title?.trim() || "";
    if (display_order !== undefined) updateData.display_order = display_order ?? 0;

    const { data, error } = await supabaseAdmin
      .from("team_members")
      .update(updateData)
      .eq("id", id)
      .select("id, photo_url, name, company_title, display_order, created_at, updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin team_members PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin team_members DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

