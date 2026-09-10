"use client";

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
type ClothingCardProps = {
  item: ClothingItem;
  tags: Tag[];
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
};
type Tag = {
  id: number;
  name: string;
};

export default function ClothingCard({
  item,
  tags,
  onEdit,
  onDelete,
}: ClothingCardProps) {
  const imageUrl = item.imagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothing-images/${item.imagePath}`
    : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E3DACB] bg-[#FFFDF9] shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EEE8DE]">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-[#A69C8C]">
              No image
            </span>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-[#FFFDF9]/90 px-3 py-1 text-xs font-medium text-[#5C5344] backdrop-blur-sm">
          {item.categoryName}
        </span>

      </div>

      {/* Information */}
      <div className="p-5">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-[#2B2620]">
              {item.name}
            </h3>

            <p className="mt-1 text-sm text-[#8A8172]">
              {item.brand}
            </p>
          </div>

          <span className="text-sm text-[#8A8172]">
            {item.size}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-[#5C5344]">
          <span
            className="h-3 w-3 rounded-full border border-[#C9BFAF]"
            style={{
              backgroundColor: item.color.toLowerCase(),
            }}
          />

          {item.color}
        </div>

        {item.tagIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tagIds.map((tagId) => {
              const tag = tags.find((tag) => tag.id === tagId);

              if (!tag) {
                return null;
              }

              return (
                <span
                  key={tag.id}
                  className="rounded-full bg-[#F0E9DE] px-3 py-1 text-xs text-[#6B6255]"
                >
                  {tag.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-2 border-t border-[#EEE7DC] pt-4">

          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex-1 rounded-lg border border-[#D8CFC1] px-3 py-2 text-sm font-medium text-[#5C5344] transition hover:bg-[#F3EDE4]"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            className="flex-1 rounded-lg border border-[#D9B8A8] px-3 py-2 text-sm font-medium text-[#9A4A25] transition hover:bg-[#F3E2D5]"
          >
            Delete
          </button>

        </div>

      </div>
    </article>
  );
}