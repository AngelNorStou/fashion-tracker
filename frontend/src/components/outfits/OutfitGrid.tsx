"use client";

import { ClothingItem, Outfit } from "@/lib/outfitZones";
import OutfitCard from "./OutfitCard";

export default function OutfitGrid({
  outfits,
  clothingItems,
  deletingId,
  onDelete,
}: {
  outfits: Outfit[];
  clothingItems: ClothingItem[];
  deletingId: number | null;
  onDelete: (outfit: Outfit) => void;
}) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {outfits.map((outfit) => (
        <OutfitCard
          key={outfit.id}
          outfit={outfit}
          clothingItems={clothingItems}
          deleting={deletingId === outfit.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}