// config/categories.ts
export const CATEGORIES_RAW = {
  Destinations: [
    "Cebu Highlights",
    "Beaches and Islands",
    "Mountain Escapes",
    "Heritage and History",
    "Hidden Gems",
    "Travel Itineraries",
  ],
  "Brands and Products": [
    "Homegrown Brands",
    "Fashion and Apparel",
    "Tech and Gadgets",
    "Beauty and Wellness",
    "Food Products",
    "Eco-Friendly and Sustainable",
  ],
  Stories: [
    "Life in Cebu",
    "Resilience and Recovery",
    "Student Stories",
    "Entrepreneur Journeys",
    "Cultural Narratives",
    "Inspirational Profiles",
  ],
  "News and Entertainment": [
    "Breaking News Cebu",
    "Local Governance",
    "Festivals and Events",
    "Entertainment Buzz",
    "Music and Arts",
    "Sports",
    "Campus News",
  ],
  Food: [
    "Cebu Favorites",
    "Street Food Finds",
    "Café and Coffee Spots",
    "Seafood Specials",
    "Sweet Treats and Desserts",
    "Food Reviews",
  ],
}; // Remove "as const"

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export type SubcategoryConfig = {
  id: number;
  label: string;
  slug: string;
  count: number;
};

export type CategoryConfig = {
  id: number;
  label: string;
  slug: string;
  count: number;
  subcategories: SubcategoryConfig[];
};

export const CATEGORIES_CONFIG: CategoryConfig[] = (() => {
  let subId = 1;
  let catId = 1;

  return Object.entries(CATEGORIES_RAW).map(([categoryLabel, subs]) => {
    const categorySlug = slugify(categoryLabel);

    const subcategories = subs.map((subLabel) => ({
      id: subId++,
      label: subLabel,
      slug: slugify(subLabel),
      count: 0,
    }));

    return {
      id: catId++,
      label: categoryLabel,
      slug: categorySlug,
      count: 0,
      subcategories,
    };
  });
})();