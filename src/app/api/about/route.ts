import { NextResponse } from "next/server";

import { readAboutFromDisk, writeAboutToDisk } from "@/lib/aboutStorage";

export async function GET() {
  try {
    const about = await readAboutFromDisk();
    return NextResponse.json({ about });
  } catch (error) {
    console.error("GET /api/about error", error);
    return NextResponse.json(
      { error: "Failed to load About Us content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const aboutPayload = body?.about ?? body;

  try {
    const about = await writeAboutToDisk(aboutPayload);
    return NextResponse.json({ about });
  } catch (error) {
    console.error("PUT /api/about error", error);
    return NextResponse.json(
      { error: "Failed to save About Us content" },
      { status: 500 }
    );
  }
}


