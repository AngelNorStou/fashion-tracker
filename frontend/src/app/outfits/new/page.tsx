"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import OutfitBuilder from "@/components/outfits/OutfitBuilder";
import { Category, ClothingItem } from "@/lib/outfitZones";

export default function NewOutfitPage() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [clothingData, categoryData] = await Promise.all([
          apiFetch("/api/clothing"),
          apiFetch("/api/categories"),
        ]);

        setClothingItems(clothingData);
        setCategories(categoryData);
      } catch (err) {
        console.error("Failed to load wardrobe:", err);

        setError(
          err instanceof Error ? err.message : "Unable to load your wardrobe."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F7F3EC] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          {loading && (
            <p className="text-sm text-[#6B6B73]">Loading your wardrobe...</p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <OutfitBuilder
              clothingItems={clothingItems}
              categories={categories}
            />
          )}
        </div>
      </main>
    </AuthGuard>
  );
}