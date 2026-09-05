"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import WardrobeFilters from "@/components/wardrobe/WardrobeFilters";
import WardrobeGrid from "@/components/wardrobe/WardrobeGrid";
import ClothingForm from "@/components/wardrobe/ClothingForm";
import TagManager from "@/components/wardrobe/TagManager";

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
  createdAt: string;
  updatedAt: string;
};

type ClothingFormData = {
  name: string;
  brand: string;
  color: string;
  size: string;
  gender: "MEN" | "WOMEN" | "UNISEX" | null;
  categoryId: number;
  tagIds: number[];
  file?: File | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type Tag = {
  id: number;
  name: string;
};

export default function WardrobePage() {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] =
    useState<ClothingItem | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState("");

    const [tags, setTags] = useState<Tag[]>([]);
    const [tagId, setTagId] = useState("");
    const [showTagManager, setShowTagManager] = useState(false);

    const [color, setColor] = useState("");

  /*
   * Load the current user's wardrobe
   */
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

  /*
   * Load wardrobe when the page opens
   */
    useEffect(() => {
      async function loadInitialData() {
        try {
          setLoading(true);
          setError("");

          const [clothingData, categoryData, tagData] =
            await Promise.all([
              apiFetch("/api/clothing"),
              apiFetch("/api/categories"),
              apiFetch("/api/tags"),
            ]);

          setItems(clothingData);
          setCategories(categoryData);
          setTags(tagData);
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

      loadInitialData();
    }, []);
  /*
   * Create clothing item
   */
    async function handleCreate(data: ClothingFormData) {
      const formData = new FormData();

      const clothingData = {
        name: data.name,
        brand: data.brand,
        color: data.color,
        size: data.size,
        gender: data.gender,
        categoryId: data.categoryId,
        tagIds: data.tagIds,
      };

      formData.append(
        "data",
        new Blob(
          [JSON.stringify(clothingData)],
          { type: "application/json" }
        )
      );

      if (data.file) {
        formData.append("file", data.file);
      }

      await apiFetch("/api/clothing", {
        method: "POST",
        body: formData,
      });

      setShowAddForm(false);

      await loadWardrobe();
    }

  /*
   * Update clothing item
   */
    async function handleUpdate(data: ClothingFormData) {
      if (!editingItem) {
        return;
      }

      const formData = new FormData();

      const clothingData = {
        name: data.name,
        brand: data.brand,
        color: data.color,
        size: data.size,
        gender: data.gender,
        categoryId: data.categoryId,
        tagIds: data.tagIds,
      };

      formData.append(
        "data",
        new Blob(
          [JSON.stringify(clothingData)],
          { type: "application/json" }
        )
      );

      if (data.file) {
        formData.append("file", data.file);
      }

      await apiFetch(`/api/clothing/${editingItem.id}`, {
        method: "PATCH",
        body: formData,
      });

      setEditingItem(null);

      await loadWardrobe();
    }
  /*
   * Delete clothing item
   */
  async function handleDelete(item: ClothingItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiFetch(`/api/clothing/${item.id}`, {
        method: "DELETE",
      });

      await loadWardrobe();
    } catch (err) {
      console.error("Failed to delete clothing item:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete clothing item."
      );
    }
  }

  /*
   * Search/filter clothing on the client for now.
   */
    const colors = Array.from(
      new Set(
        items
          .map((item) => item.color.trim())
          .filter(Boolean)
      )
    ).sort();

    const filteredItems = items.filter((item) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.color.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query);

      const matchesCategory =
        !categoryId ||
        item.categoryId.toString() === categoryId;

      const matchesColor =
        !color ||
        item.color.toLowerCase() === color.toLowerCase();

      const matchesTag =
        !tagId ||
        item.tagIds.includes(Number(tagId));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesColor &&
        matchesTag
      );
    });
  /*
   * Reload Tags
   */
    async function loadTags() {
      const data = await apiFetch("/api/tags");
      setTags(data);
    }
  return (
    <AuthGuard>
      <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

          {/* =========================
              HEADER
          ========================== */}
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowTagManager(true)}
                className="rounded-xl border border-[#D8CFC1] bg-[#FFFDF9] px-5 py-3 text-sm font-medium text-[#5C5344] hover:bg-[#F3EDE4]"
              >
                Manage tags
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="rounded-xl bg-[#C1592F] px-5 py-3 text-sm font-medium text-white hover:bg-[#9A4A25]"
              >
                + Add clothing
              </button>
            </div>
          </div>

          {/* =========================
              FILTERS
          ========================== */}
            <WardrobeFilters
              search={search}
              setSearch={setSearch}
              categories={categories}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              colors={colors}
              color={color}
              setColor={setColor}
              tags={tags}
              tagId={tagId}
              setTagId={setTagId}
            />
          {/* =========================
              LOADING
          ========================== */}
          {loading && (
            <div className="mt-10 py-12 text-center">
              <p className="text-sm text-[#8A8172]">
                Loading your wardrobe...
              </p>
            </div>
          )}

          {/* =========================
              ERROR
          ========================== */}
          {!loading && error && (
            <div className="mt-10 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">
                {error}
              </p>
            </div>
          )}

          {/* =========================
              WARDROBE RESULTS
          ========================== */}
          {!loading && !error && (
            <>
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-[#8A8172]">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

                <WardrobeGrid
                  items={filteredItems}
                  tags={tags}
                  onEdit={setEditingItem}
                  onDelete={handleDelete}
                />
            </>
          )}
        </div>

        {/* =========================
            ADD CLOTHING MODAL
        ========================== */}
        {showAddForm && (
            <ClothingForm
              categories={categories}
              tags={tags}
              onSubmit={handleCreate}
              onCancel={() => setShowAddForm(false)}
            />
        )}

        {/* =========================
            EDIT CLOTHING MODAL
        ========================== */}
        {editingItem && (
            <ClothingForm
              item={editingItem}
              categories={categories}
              tags={tags}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
            />
        )}
        {/* =========================
            EDIT TAGS MODAL
        ========================== */}
        {showTagManager && (
          <TagManager
            tags={tags}
            onTagsChanged={loadTags}
            onClose={() => setShowTagManager(false)}
          />
        )}
      </main>
    </AuthGuard>
  );
}