import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone_number, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (phone_number) {
      // Remove country code and spaces for validation
      const phoneWithoutCountry = phone_number.replace(/^\+\d+\s?/, "").replace(/[\s\-\(\)]/g, "");
      
      // Basic validation: should contain only digits and be reasonable length
      if (!/^\d+$/.test(phoneWithoutCountry)) {
        return NextResponse.json(
          { error: "Phone number should contain only numbers" },
          { status: 400 }
        );
      }

      if (phoneWithoutCountry.length < 7 || phoneWithoutCountry.length > 15) {
        return NextResponse.json(
          { error: "Phone number should be between 7 and 15 digits" },
          { status: 400 }
        );
      }
    }

    const supabaseAdmin = createAdminClient();

    // Insert into contact_form table
    const { data, error } = await supabaseAdmin
      .from("contact_form")
      .insert([
        {
          name,
          email,
          company: company || null,
          phone_number: phone_number || null,
          message,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Contact form insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit contact form" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Contact form POST error:", err);
    return NextResponse.json(
      { error: "Failed to process contact form submission" },
      { status: 500 }
    );
  }
}

