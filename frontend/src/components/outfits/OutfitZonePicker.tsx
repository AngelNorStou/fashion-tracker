"use client";

import { ClothingItem, imageUrlFor } from "@/lib/outfitZones";

export default function OutfitZonePicker({
  zoneLabel,
  items,
  selectedIds,
  onToggle,
  onClose,
}: {
  zoneLabel: string;
  items: ClothingItem[];
  selectedIds: Set<number>;
  onToggle: (itemId: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#FFFDF9] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E3DACB] px-6 py-4">
          <h3 className="text-base font-semibold text-[#2B2620]">
            Add to {zoneLabel}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-[#8A8172] hover:text-[#2B2620]"
          >
            ×
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-center text-sm text-[#8A8172]">
              No wardrobe items in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => {
                const selected = selectedIds.has(item.id);
                const imageUrl = imageUrlFor(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={`relative overflow-hidden rounded-xl border-2 text-left transition ${
                      selected
                        ? "border-[#C1592F] bg-[#F3E2D5]"
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
                        <div className="flex h-full items-center justify-center px-2 text-center">
                          <span className="text-xs text-[#A69C8C]">
                            No image
                          </span>
                        </div>
                      )}

                      {selected && (
                        <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#C1592F] text-xs font-bold text-white">
                          ✓
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-[#2B2620]">
                        {item.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[#E3DACB] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}