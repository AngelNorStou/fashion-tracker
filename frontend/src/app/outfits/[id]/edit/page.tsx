"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import OutfitBuilder from "@/components/outfits/OutfitBuilder";
import { Category, ClothingItem, Outfit } from "@/lib/outfitZones";

export default function EditOutfitPage() {
  const params = useParams();
  const outfitId = Number(params.id);

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [outfitData, clothingData, categoryData] = await Promise.all([
          apiFetch(`/api/outfits/${outfitId}`),
          apiFetch("/api/clothing"),
          apiFetch("/api/categories"),
        ]);

        setOutfit(outfitData);
        setClothingItems(clothingData);
        setCategories(categoryData);
      } catch (err) {
        console.error("Failed to load outfit:", err);

        setError(
          err instanceof Error ? err.message : "Unable to load this outfit."
        );
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isNaN(outfitId)) {
      loadData();
    }
  }, [outfitId]);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F7F3EC] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          {loading && (
                        <p className="text-sm text-[#6B6B73]">Loading outfit...</p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          {!loading && !error && outfit && (
            <OutfitBuilder
              outfit={outfit}
              clothingItems={clothingItems}
              categories={categories}
            />
          )}
        </div>
      </main>
    </AuthGuard>
  );
}