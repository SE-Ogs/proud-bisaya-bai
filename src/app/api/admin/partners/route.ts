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
      .from("partners")
      .select("id, name, description, image_url, url, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin partners GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = await requireAdmin();
    const body = await request.json();
    const { name, description, image_url, url } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required and must be a string" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("partners")
      .insert({
        name: name.trim(),
        description: description?.trim() || "",
        image_url: image_url?.trim() || "",
        url: url?.trim() || "",
      })
      .select("id, name, description, image_url, url, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin partners POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabaseAdmin = await requireAdmin();
    const body = await request.json();
    const { id, name, description, image_url, url } = body;

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
    };

    if (description !== undefined) updateData.description = description?.trim() || "";
    if (image_url !== undefined) updateData.image_url = image_url?.trim() || "";
    if (url !== undefined) updateData.url = url?.trim() || "";

    const { data, error } = await supabaseAdmin
      .from("partners")
      .update(updateData)
      .eq("id", id)
      .select("id, name, description, image_url, url, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin partners PUT error:", err);
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
      .from("partners")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin partners DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

