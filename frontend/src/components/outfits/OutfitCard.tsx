"use client";

import Link from "next/link";
import { ClothingItem, Outfit, imageUrlFor } from "@/lib/outfitZones";

export default function OutfitCard({
  outfit,
  clothingItems,
  onDelete,
  deleting,
}: {
  outfit: Outfit;
  clothingItems: ClothingItem[];
  onDelete: (outfit: Outfit) => void;
  deleting: boolean;
}) {
  function getClothingItem(id: number) {
    return clothingItems.find((item) => item.id === id);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9]">
      <Link href={`/outfits/${outfit.id}`}>
        <div className="grid grid-cols-2 gap-1 bg-[#F3EDE4] p-1">
          {[...outfit.items]
            .sort((a, b) => a.layerOrder - b.layerOrder)
            .slice(0, 4)
            .map((outfitItem) => {
              const item = getClothingItem(outfitItem.clothingItemId);

              if (!item) {
                return (
                  <div
                    key={outfitItem.clothingItemId}
                    className="flex aspect-square items-center justify-center bg-[#EEE8DE]"
                  >
                    <span className="text-xs text-[#A69C8C]">No item</span>
                  </div>
                );
              }

              const imageUrl = imageUrlFor(item);

              return (
                <div
                  key={item.id}
                  className="aspect-square overflow-hidden bg-[#EEE8DE]"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center">
                      <span className="text-xs text-[#A69C8C]">
                        {item.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/outfits/${outfit.id}`}>
          <h2 className="text-lg font-medium text-[#2B2620] hover:text-[#C1592F]">
            {outfit.name}
          </h2>
        </Link>

        <p className="mt-1 text-sm text-[#8A8172]">
          {outfit.items.length} {outfit.items.length === 1 ? "item" : "items"}
        </p>

        <div className="mt-5 flex gap-2">
          <Link
            href={`/outfits/${outfit.id}/edit`}
            className="flex-1 rounded-lg border border-[#D8CFC1] px-3 py-2 text-center text-sm text-[#5C5344] hover:bg-[#F3EDE4]"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={() => onDelete(outfit)}
            disabled={deleting}
            className="flex-1 rounded-lg border border-[#D9B8A8] px-3 py-2 text-sm text-[#C1592F] hover:bg-[#F3E2D5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}