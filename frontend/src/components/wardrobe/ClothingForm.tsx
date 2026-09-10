"use client";

import { FormEvent, useState } from "react";

type Tag = {
  id: number;
  name: string;
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
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type ClothingFormData = {
  name: string;
  brand: string;
  color: string;
  size: string;
  gender: "MEN" | "WOMEN" | "UNISEX";
  categoryId: number;
  tagIds: number[];
  file?: File | null;
};

type ClothingFormProps = {
  item?: ClothingItem | null;
  categories: Category[];
  tags: Tag[];
  onSubmit: (data: ClothingFormData) => Promise<void>;
  onCancel: () => void;
};

// Every value here must be a color CSS actually recognizes, since
// items are rendered elsewhere as: backgroundColor: item.color.toLowerCase()
const COLOR_SWATCHES = [
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
  { label: "Gray", value: "gray" },
  { label: "Red", value: "red" },
  { label: "Orange", value: "orange" },
  { label: "Yellow", value: "yellow" },
  { label: "Green", value: "green" },
  { label: "Blue", value: "blue" },
  { label: "Navy", value: "navy" },
  { label: "Purple", value: "purple" },
  { label: "Pink", value: "pink" },
  { label: "Brown", value: "brown" },
  { label: "Beige", value: "beige" },
  { label: "Tan", value: "tan" },
  { label: "Olive", value: "olive" },
  { label: "Maroon", value: "maroon" },
  { label: "Teal", value: "teal" },
  { label: "Gold", value: "gold" },
];

export default function ClothingForm({
  item,
  categories,
  tags,
  onSubmit,
  onCancel,
}: ClothingFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [color, setColor] = useState(item?.color ?? "");
  const [size, setSize] = useState(item?.size ?? "");

  const [gender, setGender] = useState<
    "MEN" | "WOMEN" | "UNISEX"
  >(item?.gender ?? "UNISEX");

  const [categoryId, setCategoryId] = useState(
    item?.categoryId?.toString() ?? ""
  );

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    item?.tagIds ?? []
  );

  // If the item's existing color doesn't match any swatch (e.g. it was
  // typed in freely before this picker existed), keep showing it as a
  // preview so editing doesn't silently discard it until a new swatch
  // is explicitly chosen.
  const matchesKnownSwatch = COLOR_SWATCHES.some(
    (swatch) => swatch.value === color.toLowerCase()
  );
  const hasUnrecognizedExistingColor = color !== "" && !matchesKnownSwatch;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!color) {
      setError("Please choose a color.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit({
        name,
        brand,
        color,
        size,
        gender,
        categoryId: Number(categoryId),
        tagIds: selectedTagIds,
        file,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save clothing item."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2620]/40 px-4">

      <div className="w-full max-w-lg rounded-2xl bg-[#FFFDF9] p-6 shadow-xl">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#2B2620]">
            {item ? "Edit clothing" : "Add clothing"}
          </h2>

          <p className="mt-1 text-sm text-[#8A8172]">
            {item
              ? "Update the information for this item."
              : "Add a new item to your wardrobe."}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
              Name
            </label>

            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C1592F]"
              placeholder="Blue T-Shirt"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
              Brand
            </label>

            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C1592F]"
              placeholder="Nike"
            />
          </div>

          {/* Color */}
          <div>
            <label
              htmlFor="color"
              className="mb-1.5 block text-sm font-medium text-[#5C5344]"
            >
              Color
            </label>

            <div className="flex items-center gap-3">
              <span
                className="h-9 w-9 flex-shrink-0 rounded-full border border-black/10"
                style={{
                  backgroundColor: color ? color.toLowerCase() : "transparent",
                }}
              />

              <select
                id="color"
                required
                value={matchesKnownSwatch ? color.toLowerCase() : ""}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm text-[#2B2620] outline-none focus:border-[#C1592F]"
              >
                <option value="" disabled>
                  Select a color
                </option>

                {COLOR_SWATCHES.map((swatch) => (
                  <option key={swatch.value} value={swatch.value}>
                    {swatch.label}
                  </option>
                ))}
              </select>
            </div>

            {hasUnrecognizedExistingColor && (
              <p className="mt-2 text-xs text-[#8A8172]">
                Current color: <span className="font-medium">{color}</span>{" "}
                — pick an option above to change it.
              </p>
            )}
          </div>
          {/* Size */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
              Size
            </label>

            <input
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C1592F]"
              placeholder="M"
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="mb-1.5 block text-sm font-medium text-[#5C5344]"
            >
              Gender
            </label>

            <select
              id="gender"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as "MEN" | "WOMEN" | "UNISEX")
              }
              className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm text-[#2B2620] outline-none focus:border-[#C1592F]"
            >
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
              Category
            </label>

            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm text-[#2B2620] outline-none focus:border-[#C1592F]"
            >
              <option value="" disabled>
                Select a category
              </option>

              {categories
                .filter((category) => category.parentId === null)
                .map((parent) => {
                  const children = categories.filter(
                    (category) => category.parentId === parent.id
                  );

                  if (children.length === 0) {
                    return (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                      </option>
                    );
                  }

                  return (
                    <optgroup key={parent.id} label={parent.name}>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#5C5344]">
              Tags
            </label>

            {tags.length === 0 ? (
              <p className="text-sm text-[#8A8172]">
                You don't have any tags yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTagIds((current) =>
                          selected
                            ? current.filter((id) => id !== tag.id)
                            : [...current, tag.id]
                        );
                      }}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        selected
                          ? "border-[#C1592F] bg-[#C1592F] text-white"
                          : "border-[#D8CFC1] bg-white text-[#5C5344] hover:bg-[#F3EDE4]"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
              Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFile(e.target.files?.[0] ?? null)
              }
              className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm text-[#5C5344]"
            />

            {item?.imagePath && !file && (
              <p className="mt-1.5 text-xs text-[#8A8172]">
                Existing image will be kept unless you select a new one.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-[#EEE7DC] pt-5">

            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#D8CFC1] px-4 py-2.5 text-sm font-medium text-[#5C5344] hover:bg-[#F3EDE4]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#C1592F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25] disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : item
                  ? "Save changes"
                  : "Add clothing"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}