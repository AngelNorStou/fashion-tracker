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

function slotForSlug(slug: string): SlotKey | null {
  switch (slug) {
    case "hats":
      return "hat";
    case "belts":
      return "belt";
    case "tops":
    case "outerwear":
      return "top";
    case "bottoms":
      return "bottom";
    case "shoes":
      return "shoes";
    case "bags":
      return "bag";
    case "dresses-jumpsuits":
      return "full";
    default:
      return null;
  }
}

/**
 * Builds a lookup from every category id to its display zone.
 * Checks the category's own slug first (so leaf categories like
 * hats/belts get their own zone despite living under "Accessories"),
 * then walks up to its top-level parent for everything else.
 */
export function buildCategoryZoneMap(
  categories: Category[]
): Map<number, SlotKey> {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const zoneMap = new Map<number, SlotKey>();

  for (const category of categories) {
    const leafSlot = slotForSlug(category.slug);

    if (leafSlot) {
      zoneMap.set(category.id, leafSlot);
      continue;
    }

    let current: Category | undefined = category;

    while (current?.parentId != null) {
      current = byId.get(current.parentId);
    }

    const parentSlot = current ? slotForSlug(current.slug) : null;
    zoneMap.set(category.id, parentSlot ?? "other");
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

export function groupBySlot(entries: LayerEntry[]) {
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