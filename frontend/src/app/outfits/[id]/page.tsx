"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import OutfitLayerPreview from "@/components/outfits/OutfitLayerPreview";
import OutfitGenerationPanel from "@/components/outfits/OutfitGenerationPanel";
import {
  Category,
  ClothingItem,
  Outfit,
  buildCategoryZoneMap,
  buildLayerEntries,
} from "@/lib/outfitZones";

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const outfitId = Number(params.id);

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!outfit) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${outfit.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await apiFetch(`/api/outfits/${outfit.id}`, {
        method: "DELETE",
      });

      router.push("/outfits");
    } catch (err) {
      console.error("Failed to delete outfit:", err);

      setError(
        err instanceof Error ? err.message : "Unable to delete outfit."
      );
      setDeleting(false);
    }
  }

  const categoryZoneMap = buildCategoryZoneMap(categories);

  const layerEntries = outfit
    ? buildLayerEntries(outfit.items, clothingItems, categoryZoneMap)
    : [];

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F7F3EC] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/outfits"
            className="text-sm text-[#6B6B73] hover:text-[#9B7EA8]"
          >
            ← Back to outfits
          </Link>

          {loading && (
            <p className="mt-6 text-sm text-[#6B6B73]">Loading outfit...</p>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          {!loading && !error && outfit && (
            <div className="mt-6 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9]">
                <div className="flex items-center justify-between border-b border-[#E3DACB] px-6 py-5">
                  <div>
                    <h1 className="text-2xl font-semibold text-[#17171C]">
                      {outfit.name}
                    </h1>

                    <p className="mt-1 text-sm text-[#6B6B73]">
                      {outfit.items.length}{" "}
                      {outfit.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/outfits/${outfit.id}/edit`}
                      className="rounded-lg border border-[#D8CFC1] px-4 py-2 text-sm text-[#4B4B52] hover:bg-[#F3EDE4]"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-lg border border-[#D8CFC1] px-4 py-2 text-sm text-[#7E6389] hover:border-[#9B7EA8] hover:bg-[#F1EAF4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="bg-[#F3EDE4] p-4">
                  <OutfitLayerPreview entries={layerEntries} readOnly />
                </div>
              </div>

              <OutfitGenerationPanel outfitId={outfit.id} />
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}