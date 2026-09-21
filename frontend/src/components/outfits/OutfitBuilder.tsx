"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import OutfitLayerPreview from "./OutfitLayerPreview";
import OutfitItemsPanel from "./OutfitItemsPanel";
import OutfitLayerOrderPanel from "./OutfitLayerOrderPanel";
import OutfitZonePicker from "./OutfitZonePicker";
import {
  Category,
  ClothingItem,
  Outfit,
  OutfitItem,
  SlotKey,
  ZONE_LABELS,
  buildCategoryZoneMap,
  buildLayerEntries,
  groupBySlot,
  canZoneHaveMultiple,
  buildExcludedCategoryIdSet,
} from "@/lib/outfitZones";

/**
 * Safety net for zones that only ever allow one item (everything
 * except Top). If an outfit somehow ended up with more than one item
 * in a single-select zone -- e.g. saved before this rule existed --
 * this keeps only the item with the highest layerOrder (the most
 * recently placed one) and drops the rest.
 */
function collapseSingleSelectZones(
  items: OutfitItem[],
  getSlot: (clothingItemId: number) => SlotKey
): OutfitItem[] {
  const byZone = new Map<SlotKey, OutfitItem[]>();

  for (const item of items) {
    const slot = getSlot(item.clothingItemId);
    const existing = byZone.get(slot) ?? [];
    existing.push(item);
    byZone.set(slot, existing);
  }

  const result: OutfitItem[] = [];

  for (const [slot, zoneItems] of byZone.entries()) {
    if (canZoneHaveMultiple(slot) || zoneItems.length <= 1) {
      result.push(...zoneItems);
      continue;
    }

    const keep = zoneItems.reduce((a, b) =>
      b.layerOrder > a.layerOrder ? b : a
    );

    result.push(keep);
  }

  return result;
}

export default function OutfitBuilder({
  outfit,
  clothingItems,
  categories,
}: {
  outfit?: Outfit;
  clothingItems: ClothingItem[];
  categories: Category[];
}) {
  const router = useRouter();

  const categoryZoneMap = buildCategoryZoneMap(categories);

  function getSlot(clothingItemId: number): SlotKey {
    const item = clothingItems.find((c) => c.id === clothingItemId);
    if (!item) return "other";
    return categoryZoneMap.get(item.categoryId) ?? "other";
  }

  const excludedCategoryIds = buildExcludedCategoryIdSet(categories);

  // Items in excluded categories (e.g. Intimates) can still exist in
  // the wardrobe, but are never offered when building an outfit.
  const pickableClothingItems = clothingItems.filter(
    (item) => !excludedCategoryIds.has(item.categoryId)
  );

  const [name, setName] = useState(outfit?.name ?? "");

  const [selectedItems, setSelectedItems] = useState<OutfitItem[]>(() =>
    outfit ? collapseSingleSelectZones(outfit.items, getSlot) : []
  );

  const [openPickerZone, setOpenPickerZone] = useState<SlotKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleItem(itemId: number) {
    setSelectedItems((current) => {
      const existingItem = current.find(
        (item) => item.clothingItemId === itemId
      );

      if (existingItem) {
        return current.filter((item) => item.clothingItemId !== itemId);
      }

      const targetSlot = getSlot(itemId);

      // Dress/suit exclusivity: a full-body item can't coexist with a
      // top, belt, or bottom, in either direction.
      const hasFull = current.some(
        (i) => getSlot(i.clothingItemId) === "full"
      );

      const bodyZones: SlotKey[] = ["top", "belt", "bottom"];

      const hasBodyItem = current.some((i) =>
        bodyZones.includes(getSlot(i.clothingItemId))
      );

      if (targetSlot === "full" && hasBodyItem) return current;
      if (bodyZones.includes(targetSlot) && hasFull) return current;

      // Most zones only ever hold one item (one pair of shoes, one
      // belt, one bag, one dress, etc). Only Top supports real
      // layering -- picking a new item elsewhere replaces whatever
      // was already selected in that zone.
      let base = current;

      if (!canZoneHaveMultiple(targetSlot)) {
        base = current.filter(
          (i) => getSlot(i.clothingItemId) !== targetSlot
        );
      }

      const sameSlotOrders = base
        .filter((i) => getSlot(i.clothingItemId) === targetSlot)
        .map((i) => i.layerOrder);

      const nextLayer =
        sameSlotOrders.length > 0 ? Math.max(...sameSlotOrders) + 1 : 1;

      return [
        ...base,
        {
          clothingItemId: itemId,
          layerOrder: nextLayer,
        },
      ];
    });
  }

  // Moves an item toward the top of its zone's stack (higher
  // layerOrder = more visible / worn over everything below it).
  // Swaps with whichever item currently sits directly above it in
  // the same zone.
  function moveItemUp(clothingItemId: number) {
    const targetSlot = getSlot(clothingItemId);

    setSelectedItems((current) => {
      const zoneItems = current
        .filter((i) => getSlot(i.clothingItemId) === targetSlot)
        .sort((a, b) => a.layerOrder - b.layerOrder);

      const idx = zoneItems.findIndex(
        (i) => i.clothingItemId === clothingItemId
      );

      if (idx === -1 || idx === zoneItems.length - 1) return current;

      const thisItem = zoneItems[idx];
      const itemAbove = zoneItems[idx + 1];

      return current.map((item) => {
        if (item.clothingItemId === thisItem.clothingItemId) {
          return { ...item, layerOrder: itemAbove.layerOrder };
        }
        if (item.clothingItemId === itemAbove.clothingItemId) {
          return { ...item, layerOrder: thisItem.layerOrder };
        }
        return item;
      });
    });
  }

  // Moves an item toward the bottom of its zone's stack. Swaps with
  // whichever item currently sits directly below it in the same zone.
  function moveItemDown(clothingItemId: number) {
    const targetSlot = getSlot(clothingItemId);

    setSelectedItems((current) => {
      const zoneItems = current
        .filter((i) => getSlot(i.clothingItemId) === targetSlot)
        .sort((a, b) => a.layerOrder - b.layerOrder);

      const idx = zoneItems.findIndex(
        (i) => i.clothingItemId === clothingItemId
      );

      if (idx <= 0) return current;

      const thisItem = zoneItems[idx];
      const itemBelow = zoneItems[idx - 1];

      return current.map((item) => {
        if (item.clothingItemId === thisItem.clothingItemId) {
          return { ...item, layerOrder: itemBelow.layerOrder };
        }
        if (item.clothingItemId === itemBelow.clothingItemId) {
          return { ...item, layerOrder: thisItem.layerOrder };
        }
        return item;
      });
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter an outfit name.");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Please select at least one clothing item.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Defensive re-check right before saving, in case anything
      // slipped past toggleItem during this editing session.
      const cleanedItems = collapseSingleSelectZones(
        selectedItems,
        getSlot
      );

      const body = {
        name: name.trim(),
        items: cleanedItems,
      };

      if (outfit) {
        await apiFetch(`/api/outfits/${outfit.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });

        router.push(`/outfits/${outfit.id}`);
      } else {
        const created = await apiFetch("/api/outfits", {
          method: "POST",
          body: JSON.stringify(body),
        });

        router.push(`/outfits/${created.id}`);
      }
    } catch (err) {
      console.error("Failed to save outfit:", err);

      setError(err instanceof Error ? err.message : "Unable to save outfit.");
    } finally {
      setSaving(false);
    }
  }

  const layerEntries = buildLayerEntries(
    selectedItems,
    clothingItems,
    categoryZoneMap
  );

  const grouped = groupBySlot(layerEntries);
  const selectedIds = new Set(selectedItems.map((i) => i.clothingItemId));

  const disabledZones = new Set<SlotKey>();

  if (grouped.full.length > 0) {
    disabledZones.add("top");
    disabledZones.add("belt");
    disabledZones.add("bottom");
  }

  if (
    grouped.top.length > 0 ||
    grouped.belt.length > 0 ||
    grouped.bottom.length > 0
  ) {
    disabledZones.add("full");
  }

  const pickerItems = openPickerZone
    ? pickableClothingItems.filter(
        (item) => getSlot(item.id) === openPickerZone
      )
    : [];

  return (
    <div className="rounded-2xl bg-[#FFFDF9] shadow-xl">
      <div className="border-b border-[#E3DACB] px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-[#17171C]">
          {outfit ? "Edit outfit" : "Create outfit"}
        </h2>

        <p className="mt-1 text-sm text-[#6B6B73]">
          Choose the clothing items that belong in this outfit.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-4 py-6 sm:px-6">
          {error && (
            <div className="mb-6 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="outfit-name"
              className="mb-1.5 block text-sm font-medium text-[#4B4B52]"
            >
              Outfit name
            </label>

            <input
              id="outfit-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekend casual"
              className="w-full max-w-md rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm text-[#17171C] outline-none placeholder:text-[#A69C8C] focus:border-[#9B7EA8]"
            />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-[#4B4B52]">
                Build your outfit
              </label>

              <span className="text-xs text-[#6B6B73]">
                {selectedItems.length} selected
              </span>
            </div>

            <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-[22%_53%_22%]">
              <OutfitItemsPanel
                grouped={grouped}
                disabledZones={disabledZones}
                onAddClick={(zone) => setOpenPickerZone(zone)}
                onRemoveItem={toggleItem}
              />

              <div className="rounded-2xl border border-[#D8CFC1] bg-[#F3EDE4] p-4 md:col-start-2 md:row-start-1 md:row-span-2 lg:col-auto lg:row-auto">
                <h3 className="mb-1 text-sm font-semibold text-[#17171C]">
                  Outfit preview
                </h3>

                <p className="mb-4 text-xs text-[#6B6B73]">
                  How this outfit is laid out.
                </p>

                <OutfitLayerPreview entries={layerEntries} readOnly />
              </div>

              <OutfitLayerOrderPanel
                grouped={grouped}
                onMoveUp={moveItemUp}
                onMoveDown={moveItemDown}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E3DACB] px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="rounded-lg border border-[#D8CFC1] px-5 py-2.5 text-sm text-[#4B4B52] hover:bg-[#F3EDE4] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !name.trim() || selectedItems.length === 0}
            className="rounded-lg bg-[#22252E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#15171D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : outfit ? "Save changes" : "Create outfit"}
          </button>
        </div>
      </form>

      {openPickerZone && (
        <OutfitZonePicker
          zoneLabel={ZONE_LABELS[openPickerZone]}
          items={pickerItems}
          selectedIds={selectedIds}
          onToggle={toggleItem}
          onClose={() => setOpenPickerZone(null)}
        />
      )}
    </div>
  );
}