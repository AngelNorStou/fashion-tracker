"use client";

import ClothingCard from "./ClothingCard";

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

type WardrobeGridProps = {
  items: ClothingItem[];
  tags: Tag[];
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
};

export default function WardrobeGrid({
  items,
  tags,
  onEdit,
  onDelete,
}: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
        <h3 className="text-lg font-medium text-[#2B2620]">
          Your wardrobe is empty
        </h3>

        <p className="mt-2 text-sm text-[#8A8172]">
          Add your first clothing item to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ClothingCard
          key={item.id}
          item={item}
          tags={tags}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}