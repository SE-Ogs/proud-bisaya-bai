import { NextResponse } from "next/server";

import {
  readServicesFromDisk,
  writeServicesToDisk,
} from "@/lib/servicesStorage";

export async function GET() {
  try {
    const services = await readServicesFromDisk();
    return NextResponse.json({ services });
  } catch (error) {
    console.error("GET /api/services error", error);
    return NextResponse.json(
      { error: "Failed to load services" },
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

  const servicesPayload = Array.isArray(body?.services) ? body.services : body;

  if (!Array.isArray(servicesPayload)) {
    return NextResponse.json(
      { error: "`services` must be an array" },
      { status: 400 }
    );
  }

  try {
    const services = await writeServicesToDisk(servicesPayload);
    return NextResponse.json({ services });
  } catch (error) {
    console.error("PUT /api/services error", error);
    return NextResponse.json(
      { error: "Failed to save services" },
      { status: 500 }
    );
  }
}

