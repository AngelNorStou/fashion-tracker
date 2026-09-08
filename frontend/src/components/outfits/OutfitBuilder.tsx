"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import OutfitLayerPreview from "./OutfitLayerPreview";
import OutfitWardrobePicker from "./OutfitWardrobePicker";
import {
  Category,
  ClothingItem,
  Outfit,
  OutfitItem,
  buildCategoryZoneMap,
  buildLayerEntries,
} from "@/lib/outfitZones";

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

  const [name, setName] = useState(outfit?.name ?? "");
  const [selectedItems, setSelectedItems] = useState<OutfitItem[]>(
    outfit?.items ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryZoneMap = buildCategoryZoneMap(categories);

  function getSlot(clothingItemId: number) {
    const item = clothingItems.find((c) => c.id === clothingItemId);
    if (!item) return "other" as const;
    return categoryZoneMap.get(item.categoryId) ?? "other";
  }

  function toggleItem(itemId: number) {
    setSelectedItems((current) => {
      const existingItem = current.find(
        (item) => item.clothingItemId === itemId
      );

      if (existingItem) {
        return current.filter((item) => item.clothingItemId !== itemId);
      }

      const targetSlot = getSlot(itemId);

      const sameSlotOrders = current
        .filter((i) => getSlot(i.clothingItemId) === targetSlot)
        .map((i) => i.layerOrder);

      const nextLayer =
        sameSlotOrders.length > 0 ? Math.max(...sameSlotOrders) + 1 : 1;

      return [
        ...current,
        {
          clothingItemId: itemId,
          layerOrder: nextLayer,
        },
      ];
    });
  }

  function moveItemUp(clothingItemId: number) {
    setSelectedItems((current) =>
      current.map((item) => {
        if (item.clothingItemId === clothingItemId) {
          return {
            ...item,
            layerOrder: Math.max(1, item.layerOrder - 1),
          };
        }

        return item;
      })
    );
  }

  function moveItemDown(clothingItemId: number) {
    const targetSlot = getSlot(clothingItemId);

    setSelectedItems((current) => {
      const sameSlotOrders = current
        .filter((i) => getSlot(i.clothingItemId) === targetSlot)
        .map((i) => i.layerOrder);

      const highestLayer =
        sameSlotOrders.length > 0 ? Math.max(...sameSlotOrders) : 1;

      return current.map((item) => {
        if (item.clothingItemId === clothingItemId) {
          return {
            ...item,
            layerOrder: Math.min(highestLayer + 1, item.layerOrder + 1),
          };
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

      const body = {
        name: name.trim(),
        items: selectedItems,
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

  const selectedIds = new Set(selectedItems.map((i) => i.clothingItemId));

  return (
    <div className="rounded-2xl bg-[#FFFDF9] shadow-xl">
      <div className="border-b border-[#E3DACB] px-6 py-5">
        <h2 className="text-xl font-semibold text-[#2B2620]">
          {outfit ? "Edit outfit" : "Create outfit"}
        </h2>

        <p className="mt-1 text-sm text-[#8A8172]">
          Choose the clothing items that belong in this outfit.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-6">
          {error && (
            <div className="mb-6 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="outfit-name"
              className="mb-1.5 block text-sm font-medium text-[#5C5344]"
            >
              Outfit name
            </label>

            <input
              id="outfit-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekend casual"
              className="w-full max-w-md rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm text-[#2B2620] outline-none focus:border-[#C1592F]"
            />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-[#5C5344]">
                Build your outfit
              </label>

              <span className="text-xs text-[#8A8172]">
                {selectedItems.length} selected
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-2xl border border-[#D8CFC1] bg-[#F3EDE4] p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#2B2620]">
                    Outfit preview
                  </h3>

                  <p className="mt-1 text-xs text-[#8A8172]">
                    Organized by where each item is worn. Hover a layer to
                    reorder or remove it.
                  </p>
                </div>

                <OutfitLayerPreview
                  entries={layerEntries}
                  onMoveUp={moveItemUp}
                  onMoveDown={moveItemDown}
                  onRemove={toggleItem}
                />
              </div>

              <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#2B2620]">
                    Your wardrobe
                  </h3>

                  <p className="mt-1 text-xs text-[#8A8172]">
                    Click an item to add or remove it from your outfit.
                  </p>
                </div>

                <OutfitWardrobePicker
                  clothingItems={clothingItems}
                  selectedIds={selectedIds}
                  onToggle={toggleItem}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E3DACB] px-6 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="rounded-lg border border-[#D8CFC1] px-5 py-2.5 text-sm text-[#5C5344] hover:bg-[#F3EDE4] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !name.trim() || selectedItems.length === 0}
            className="rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : outfit ? "Save changes" : "Create outfit"}
          </button>
        </div>
      </form>
    </div>
  );
}