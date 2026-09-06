"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

type Outfit = {
  id: number;
  name: string;
  clothingItemIds: number[];
  createdAt: string;
  updatedAt: string;
};

type ClothingItem = {
  id: number;
  name: string;
  brand: string;
  color: string;
  size: string;
  gender: "MEN" | "WOMEN" | "UNISEX" | null;
  imagePath: string | null;
  categoryId: number;
  categoryName: string;
  tagIds: number[];
};

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);

  const [name, setName] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);
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
        err instanceof Error
          ? err.message
          : "Unable to load your outfits."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateForm() {
    setEditingOutfit(null);
    setName("");
    setSelectedItemIds([]);
    setShowForm(true);
  }

  function openEditForm(outfit: Outfit) {
    setEditingOutfit(outfit);
    setName(outfit.name);
    setSelectedItemIds(outfit.clothingItemIds);
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingOutfit(null);
    setName("");
    setSelectedItemIds([]);
  }

  function toggleItem(itemId: number) {
    setSelectedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter an outfit name.");
      return;
    }

    if (selectedItemIds.length === 0) {
      setError("Please select at least one clothing item.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const body = {
        name: name.trim(),
        clothingItemIds: selectedItemIds,
      };

      if (editingOutfit) {
        await apiFetch(`/api/outfits/${editingOutfit.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/api/outfits", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      closeForm();
      await loadData();
    } catch (err) {
      console.error("Failed to save outfit:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save outfit."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(outfit: Outfit) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${outfit.name}"?`
    );

    if (!confirmed) {
      return;
    }

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
        err instanceof Error
          ? err.message
          : "Unable to delete outfit."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getClothingItem(id: number) {
    return clothingItems.find((item) => item.id === id);
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F7F3EC] px-6 py-10">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2B2620]">
                Outfits
              </h1>

              <p className="mt-1 text-sm text-[#8A8172]">
                Create and organize outfits from your wardrobe.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-xl bg-[#C1592F] px-5 py-3 text-sm font-medium text-white hover:bg-[#9A4A25]"
            >
              + Create outfit
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">
                {error}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-10 rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
              <p className="text-sm text-[#8A8172]">
                Loading your outfits...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && outfits.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
              <h2 className="text-lg font-medium text-[#2B2620]">
                No outfits yet
              </h2>

              <p className="mt-2 text-sm text-[#8A8172]">
                Create your first outfit from the clothing in your wardrobe.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 rounded-xl bg-[#C1592F] px-5 py-3 text-sm font-medium text-white hover:bg-[#9A4A25]"
              >
                + Create your first outfit
              </button>
            </div>
          )}

          {/* Outfit cards */}
          {!loading && outfits.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="overflow-hidden rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9]"
                >
                  {/* Preview */}
                  <div className="grid grid-cols-2 gap-1 bg-[#F3EDE4] p-1">
                    {outfit.clothingItemIds
                      .slice(0, 4)
                      .map((itemId) => {
                        const item = getClothingItem(itemId);

                        if (!item) {
                          return (
                            <div
                              key={itemId}
                              className="flex aspect-square items-center justify-center bg-[#EEE8DE]"
                            >
                              <span className="text-xs text-[#A69C8C]">
                                No item
                              </span>
                            </div>
                          );
                        }

                        const imageUrl = item.imagePath
                          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothing-images/${item.imagePath}`
                          : null;

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

                  {/* Details */}
                  <div className="p-5">
                    <h2 className="text-lg font-medium text-[#2B2620]">
                      {outfit.name}
                    </h2>

                    <p className="mt-1 text-sm text-[#8A8172]">
                      {outfit.clothingItemIds.length}{" "}
                      {outfit.clothingItemIds.length === 1
                        ? "item"
                        : "items"}
                    </p>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(outfit)}
                        className="flex-1 rounded-lg border border-[#D8CFC1] px-3 py-2 text-sm text-[#5C5344] hover:bg-[#F3EDE4]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(outfit)}
                        disabled={deletingId === outfit.id}
                        className="flex-1 rounded-lg border border-[#D9B8A8] px-3 py-2 text-sm text-[#C1592F] hover:bg-[#F3E2D5] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === outfit.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-[#FFFDF9] shadow-xl">

                {/* Modal header */}
                <div className="flex items-center justify-between border-b border-[#E3DACB] px-6 py-5">
                  <div>
                    <h2 className="text-xl font-semibold text-[#2B2620]">
                      {editingOutfit
                        ? "Edit outfit"
                        : "Create outfit"}
                    </h2>

                    <p className="mt-1 text-sm text-[#8A8172]">
                      Choose the clothing items that belong in this outfit.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="text-2xl leading-none text-[#8A8172] hover:text-[#2B2620]"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="max-h-[65vh] overflow-y-auto px-6 py-6">

                    {/* Name */}
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
                        className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm text-[#2B2620] outline-none focus:border-[#C1592F]"
                      />
                    </div>

                    {/* Clothing selection */}
                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="block text-sm font-medium text-[#5C5344]">
                          Clothing items
                        </label>

                        <span className="text-xs text-[#8A8172]">
                          {selectedItemIds.length} selected
                        </span>
                      </div>

                      {clothingItems.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#D8CFC1] bg-[#F3EDE4] px-5 py-8 text-center">
                          <p className="text-sm text-[#8A8172]">
                            Your wardrobe is empty.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                          {clothingItems.map((item) => {
                            const selected = selectedItemIds.includes(
                              item.id
                            );

                            const imageUrl = item.imagePath
                              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothing-images/${item.imagePath}`
                              : null;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleItem(item.id)}
                                className={`overflow-hidden rounded-xl border-2 text-left transition ${
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
                                    <div className="flex h-full items-center justify-center px-3 text-center">
                                      <span className="text-xs text-[#A69C8C]">
                                        No image
                                      </span>
                                    </div>
                                  )}

                                  {selected && (
                                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#C1592F] text-sm font-bold text-white">
                                      ✓
                                    </div>
                                  )}
                                </div>

                                <div className="p-3">
                                  <p className="truncate text-sm font-medium text-[#2B2620]">
                                    {item.name}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-[#8A8172]">
                                    {item.brand}
                                  </p>

                                  <p className="mt-1 text-xs text-[#8A8172]">
                                    {item.categoryName}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 border-t border-[#E3DACB] px-6 py-4">
                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={saving}
                      className="rounded-lg border border-[#D8CFC1] px-5 py-2.5 text-sm text-[#5C5344] hover:bg-[#F3EDE4] disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        !name.trim() ||
                        selectedItemIds.length === 0
                      }
                      className="rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : editingOutfit
                          ? "Save changes"
                          : "Create outfit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}