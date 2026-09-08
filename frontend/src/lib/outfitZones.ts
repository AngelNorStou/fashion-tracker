export type OutfitItem = {
  clothingItemId: number;
  layerOrder: number;
};

export type Outfit = {
  id: number;
  name: string;
  items: OutfitItem[];
  createdAt: string;
  updatedAt: string;
};

export type ClothingItem = {
  id: number;
  name: string;
  brand: string;
  color: string;
  size: string;
  gender: "MEN" | "WOMEN" | "UNISEX" | null;
  imagePath: string | null;
  categoryId: number;
  categoryName: string;
  tagIds: number[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

export type SlotKey =
  | "hat"
  | "top"
  | "belt"
  | "bottom"
  | "shoes"
  | "bag"
  | "full"
  | "other";

export type LayerEntry = {
  item: ClothingItem;
  layerOrder: number;
  slot: SlotKey;
};

export const ZONE_ORDER: SlotKey[] = [
  "hat",
  "top",
  "belt",
  "bottom",
  "shoes",
  "bag",
  "full",
  "other",
];

export const ZONE_LABELS: Record<SlotKey, string> = {
  hat: "Hat",
  top: "Top",
  belt: "Belt",
  bottom: "Bottom",
  shoes: "Shoes",
  bag: "Bags",
  full: "Full Outfit / Dress / Suit",
  other: "Accessories",
};

export const ZONE_ICONS: Record<SlotKey, string> = {
  hat: "🧢",
  top: "👕",
  belt: "➖",
  bottom: "👖",
  shoes: "👟",
  bag: "👜",
  full: "👗",
  other: "💍",
};

// Only Top supports true layering (t-shirt under a jacket, etc).
// Every other zone is single-select: picking a new item replaces
// whatever was already there.
const MULTI_LAYER_ZONES = new Set<SlotKey>(["top"]);

export function canZoneHaveMultiple(zone: SlotKey): boolean {
  return MULTI_LAYER_ZONES.has(zone);
}

// Categories excluded from outfit building entirely (still fine to
// catalog in the wardrobe, just never selectable when assembling an
// outfit).
const EXCLUDED_CATEGORY_SLUGS = new Set(["bras", "underwear"]);


// The entire Intimates category tree is excluded from outfit building
// (still fine to catalog in the wardrobe, just never selectable when
// assembling an outfit). Excluding by top-level parent means any new
// subcategory added under Intimates is automatically excluded too,
const EXCLUDED_TOP_LEVEL_SLUGS = new Set(["intimates"]);

export function buildExcludedCategoryIdSet(
  categories: Category[]
): Set<number> {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const excluded = new Set<number>();

  for (const category of categories) {
    let current: Category | undefined = category;

    while (current?.parentId != null) {
      current = byId.get(current.parentId);
    }

    if (current && EXCLUDED_TOP_LEVEL_SLUGS.has(current.slug)) {
      excluded.add(category.id);
    }
  }

  return excluded;
}

/**
 * Default zone for every TOP-LEVEL category (parentId === null). This
 * is the only table that needs to exist — any new leaf category you
 * add in the DB automatically resolves to its parent's zone via the
 * walk in buildCategoryZoneMap below, with no code change required.
 */
const TOP_LEVEL_ZONE_MAP: Record<string, SlotKey> = {
  tops: "top",
  bottoms: "bottom",
  "dresses-jumpsuits": "full",
  outerwear: "top",
  activewear: "top", // assumption: no subcategories exist to disambiguate
  "sleep-lounge": "top", // assumption: no subcategories exist to disambiguate
  swimwear: "full",
  intimates: "other",
  "socks-hosiery": "other",
  shoes: "shoes",
  bags: "bag",
  accessories: "other",
};

/**
 * Leaf-level overrides — ONLY for categories whose correct zone
 * differs from what their parent would otherwise assign. Belts and
 * Hats live under Accessories (which defaults to "other") but need
 * their own dedicated zones; Camisoles lives under Intimates (which
 * defaults to "other") but functions as a top layer. Every other
 * leaf category is intentionally left out of this table because it
 * already inherits the correct zone from its parent.
 */
const LEAF_OVERRIDE_ZONE_MAP: Record<string, SlotKey> = {
  belts: "belt",
  hats: "hat",
  camisoles: "top",
};

/**
 * Builds a lookup from every category id to its display zone.
 * Checks the category's own slug against the leaf override table
 * first (for the few categories that diverge from their parent),
 * then walks up to the top-level parent and looks that slug up in
 * the top-level table.
 */
export function buildCategoryZoneMap(
  categories: Category[]
): Map<number, SlotKey> {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const zoneMap = new Map<number, SlotKey>();

  for (const category of categories) {
    const override = LEAF_OVERRIDE_ZONE_MAP[category.slug];

    if (override) {
      zoneMap.set(category.id, override);
      continue;
    }

    let current: Category | undefined = category;

    while (current?.parentId != null) {
      current = byId.get(current.parentId);
    }

    const topLevelMatch = current
      ? TOP_LEVEL_ZONE_MAP[current.slug]
      : undefined;

    zoneMap.set(category.id, topLevelMatch ?? "other");
  }

  return zoneMap;
}

export function imageUrlFor(item: ClothingItem) {
  return item.imagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothing-images/${item.imagePath}`
    : null;
}

export function buildLayerEntries(
  outfitItems: OutfitItem[],
  clothingItems: ClothingItem[],
  categoryZoneMap: Map<number, SlotKey>
): LayerEntry[] {
  return outfitItems
    .map((outfitItem) => {
      const item = clothingItems.find(
        (c) => c.id === outfitItem.clothingItemId
      );

      if (!item) return null;

      return {
        item,
        layerOrder: outfitItem.layerOrder,
        slot: categoryZoneMap.get(item.categoryId) ?? "other",
      };
    })
    .filter((entry): entry is LayerEntry => entry !== null)
    .sort((a, b) => a.layerOrder - b.layerOrder);
}

export function groupBySlot(
  entries: LayerEntry[]
): Record<SlotKey, LayerEntry[]> {
  const bySlot = (slot: SlotKey) => entries.filter((e) => e.slot === slot);

  return {
    hat: bySlot("hat"),
    top: bySlot("top"),
    belt: bySlot("belt"),
    bottom: bySlot("bottom"),
    shoes: bySlot("shoes"),
    bag: bySlot("bag"),
    full: bySlot("full"),
    other: bySlot("other"),
  };
}

/**
 * Flattens all entries into one ordered list for the "Layer order"
 * panel: grouped by zone in body order, then by layer within the zone.
 */
export function sortEntriesByZoneThenLayer(
  entries: LayerEntry[]
): LayerEntry[] {
  return [...entries].sort((a, b) => {
    const zoneDiff = ZONE_ORDER.indexOf(a.slot) - ZONE_ORDER.indexOf(b.slot);
    if (zoneDiff !== 0) return zoneDiff;
    return a.layerOrder - b.layerOrder;
  });
}

// Short labels for the breadcrumb trail under the preview.
export const BREADCRUMB_LABELS: Record<SlotKey, string> = {
  hat: "hat",
  top: "top",
  belt: "belt",
  bottom: "bottom",
  shoes: "shoes",
  bag: "bag",
  full: "full outfit",
  other: "accessories",
};

/**
 * The body-column zone chain for the current mode: dress/suit mode
 * collapses top/belt/bottom into a single "full" zone; separates mode
 * shows all three individually. Hat and shoes bookend both.
 */
export function getActiveBodyChain(hasFull: boolean): SlotKey[] {
  return hasFull
    ? ["hat", "full", "shoes"]
    : ["hat", "top", "belt", "bottom", "shoes"];
}