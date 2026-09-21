"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import OutfitGrid from "@/components/outfits/OutfitGrid";
import { ClothingItem, Outfit } from "@/lib/outfitZones";

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [outfitData, clothingData] = await Promise.all([
        apiFetch("/api/outfits"),
        apiFetch("/api/clothing"),
      ]);

      setOutfits(outfitData);
      setClothingItems(clothingData);
    } catch (err) {
      console.error("Failed to load outfits:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load your outfits."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(outfit: Outfit) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${outfit.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(outfit.id);
      setError("");

      await apiFetch(`/api/outfits/${outfit.id}`, {
        method: "DELETE",
      });

      await loadData();
    } catch (err) {
      console.error("Failed to delete outfit:", err);

      setError(
        err instanceof Error ? err.message : "Unable to delete outfit."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F7F3EC] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#17171C]">
                Outfits
              </h1>

              <p className="mt-1 text-sm text-[#6B6B73]">
                Create and organize outfits from your wardrobe.
              </p>
            </div>

            <Link
              href="/outfits/new"
              className="rounded-xl bg-[#22252E] px-5 py-3 text-sm font-medium text-white hover:bg-[#15171D]"
            >
              + Create outfit
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          {loading && (
            <div className="mt-10 rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
              <p className="text-sm text-[#6B6B73]">
                Loading your outfits...
              </p>
            </div>
          )}

          {!loading && outfits.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
              <h2 className="text-lg font-medium text-[#17171C]">
                No outfits yet
              </h2>

              <p className="mt-2 text-sm text-[#6B6B73]">
                Create your first outfit from the clothing in your wardrobe.
              </p>

              <Link
                href="/outfits/new"
                className="mt-6 inline-block rounded-xl bg-[#22252E] px-5 py-3 text-sm font-medium text-white hover:bg-[#15171D]"
              >
                + Create your first outfit
              </Link>
            </div>
          )}

          {!loading && outfits.length > 0 && (
            <OutfitGrid
              outfits={outfits}
              clothingItems={clothingItems}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
    </AuthGuard>
  );
}