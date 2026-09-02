"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import WardrobeFilters from "@/components/wardrobe/WardrobeFilters";
import WardrobeGrid from "@/components/wardrobe/WardrobeGrid";

type ClothingItem = {
  id: number;
  name: string;
  brand: string;
  color: string;
  size: string;
  imagePath: string | null;
  categoryId: number;
  categoryName: string;
  tagIds: number[];
  createdAt: string;
  updatedAt: string;
};

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWardrobe() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/api/clothing");

        setItems(data);
      } catch (err) {
        console.error("Failed to load wardrobe:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your wardrobe."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWardrobe();
  }, []);

  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query) ||
      item.color.toLowerCase().includes(query) ||
      item.categoryName.toLowerCase().includes(query)
    );
  });

  return (
    <AuthGuard>
      <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC]">

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

          {/* Header */}
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[#C1592F]">
                Your collection
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-[#2B2620] sm:text-5xl">
                Wardrobe
              </h1>

              <p className="mt-3 max-w-xl text-base text-[#8A8172]">
                Browse and manage everything in your digital wardrobe.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl bg-[#C1592F] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#9A4A25]"
            >
              + Add clothing
            </button>

          </div>

          {/* Filters */}
          <WardrobeFilters
            search={search}
            setSearch={setSearch}
          />

          {/* Loading */}
          {loading && (
            <div className="mt-10 py-12 text-center">
              <p className="text-sm text-[#8A8172]">
                Loading your wardrobe...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-10 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">
                {error}
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              <div className="mt-8">
                <p className="text-sm text-[#8A8172]">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1 ? "item" : "items"}
                </p>
              </div>

              <WardrobeGrid items={filteredItems} />
            </>
          )}

        </div>
      </main>
    </AuthGuard>
  );
}