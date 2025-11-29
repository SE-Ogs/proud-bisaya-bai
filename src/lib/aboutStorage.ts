import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

import type { AboutContent, AboutAward } from "@/types/about";
import { DEFAULT_ABOUT_CONTENT } from "@/data/aboutDefaults";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const ABOUT_FILE_PATH = path.join(DATA_DIRECTORY, "about.json");

async function ensureAboutFileExists() {
  try {
    await fs.access(ABOUT_FILE_PATH);
  } catch {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    await fs.writeFile(
      ABOUT_FILE_PATH,
      JSON.stringify(DEFAULT_ABOUT_CONTENT, null, 2),
      "utf8"
    );
  }
}

function sanitizeAward(award: any): AboutAward {
  const id =
    typeof award?.id === "string" && award.id.trim().length > 0
      ? award.id.trim()
      : `award-${randomUUID()}`;

  const title =
    typeof award?.title === "string" ? award.title.trim() : "Untitled Award";
  const years =
    typeof award?.years === "string" ? award.years.trim() : "Year not set";

  return { id, title, years };
}

function sanitizeAboutContent(data: any): AboutContent {
  if (!data || typeof data !== "object") {
    return DEFAULT_ABOUT_CONTENT;
  }

  const id =
    typeof data.id === "string" && data.id.trim().length > 0
      ? data.id.trim()
      : DEFAULT_ABOUT_CONTENT.id;

  const body =
    typeof data.body === "string" && data.body.trim().length > 0
      ? data.body
      : DEFAULT_ABOUT_CONTENT.body;

  const awardsArray: any[] = Array.isArray(data.awards) ? data.awards : [];
  const awards =
    awardsArray.length > 0
      ? awardsArray.map((award) => sanitizeAward(award))
      : DEFAULT_ABOUT_CONTENT.awards;

  return { id, body, awards };
}

export async function readAboutFromDisk(): Promise<AboutContent> {
  await ensureAboutFileExists();

  try {
    const raw = await fs.readFile(ABOUT_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return sanitizeAboutContent(parsed);
  } catch (error) {
    console.error("Failed to read about.json, using defaults:", error);
    return DEFAULT_ABOUT_CONTENT;
  }
}

export async function writeAboutToDisk(payload: any): Promise<AboutContent> {
  const sanitized = sanitizeAboutContent(payload);

  await ensureAboutFileExists();
  await fs.writeFile(
    ABOUT_FILE_PATH,
    JSON.stringify(sanitized, null, 2),
    "utf8"
  );

  return sanitized;
}

export { ABOUT_FILE_PATH };


