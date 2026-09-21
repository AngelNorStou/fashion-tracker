"use client";

import { ClothingItem, imageUrlFor } from "@/lib/outfitZones";

export default function OutfitWardrobePicker({
  clothingItems,
  selectedIds,
  onToggle,
}: {
  clothingItems: ClothingItem[];
  selectedIds: Set<number>;
  onToggle: (itemId: number) => void;
}) {
  if (clothingItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#D8CFC1] bg-[#F3EDE4] px-5 py-8 text-center">
        <p className="text-sm text-[#6B6B73]">Your wardrobe is empty.</p>
      </div>
    );
  }

 return (
    <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto pr-2 sm:grid-cols-3">
      {clothingItems.map((item) => {
        const selected = selectedIds.has(item.id);
        const imageUrl = imageUrlFor(item);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`relative overflow-hidden rounded-xl border-2 text-left transition ${
              selected
                ? "border-[#9B7EA8] bg-[#F1EAF4]"
                : "border-[#E3DACB] bg-white hover:border-[#C9BFAF]"
            }`}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#EEE8DE]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center">
                  <span className="text-xs text-[#A69C8C]">No image</span>
                </div>
              )}

              {selected && (
                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#22252E] text-sm font-bold text-white">
                  ✓
                </div>
              )}
            </div>

            <div className="p-2.5">
              <p className="truncate text-sm font-medium text-[#17171C]">
                {item.name}
              </p>

              <p className="mt-1 truncate text-xs text-[#6B6B73]">
                {item.categoryName}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}