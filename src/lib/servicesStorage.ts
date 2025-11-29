import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

import { ServiceCard } from "@/types/services";
import { DEFAULT_SERVICE_CARDS } from "@/data/servicesDefaults";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const SERVICES_FILE_PATH = path.join(DATA_DIRECTORY, "services.json");

async function ensureServicesFileExists() {
  try {
    await fs.access(SERVICES_FILE_PATH);
  } catch {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    await fs.writeFile(
      SERVICES_FILE_PATH,
      JSON.stringify(DEFAULT_SERVICE_CARDS, null, 2),
      "utf8"
    );
  }
}

function sanitizeServiceCard(
  card: Partial<ServiceCard> & { id?: string },
  index: number
): ServiceCard {
  const id =
    typeof card.id === "string" && card.id.trim().length > 0
      ? card.id.trim()
      : `service-${index + 1}-${randomUUID()}`;

  const title =
    typeof card.title === "string" && card.title.trim().length > 0
      ? card.title.trim()
      : "Untitled Service";

  const description =
    typeof card.description === "string" ? card.description.trim() : "";

  const features = Array.isArray(card.features)
    ? card.features
        .map((feature) =>
          typeof feature === "string" ? feature.trim() : ""
        )
        .filter(Boolean)
    : [];

  return {
    id,
    title,
    description,
    features,
  };
}

export function sanitizeServiceCards(data: any): ServiceCard[] {
  if (!Array.isArray(data)) {
    return DEFAULT_SERVICE_CARDS;
  }

  const sanitized = data.map((card, index) =>
    sanitizeServiceCard(card, index)
  );

  return sanitized.length > 0 ? sanitized : DEFAULT_SERVICE_CARDS;
}

export async function readServicesFromDisk(): Promise<ServiceCard[]> {
  await ensureServicesFileExists();

  try {
    const raw = await fs.readFile(SERVICES_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return sanitizeServiceCards(parsed);
  } catch (error) {
    console.error("Failed to read services.json, using defaults:", error);
    return DEFAULT_SERVICE_CARDS;
  }
}

export async function writeServicesToDisk(
  services: any
): Promise<ServiceCard[]> {
  const sanitized = sanitizeServiceCards(services);

  await ensureServicesFileExists();
  await fs.writeFile(
    SERVICES_FILE_PATH,
    JSON.stringify(sanitized, null, 2),
    "utf8"
  );

  return sanitized;
}

export { SERVICES_FILE_PATH };

