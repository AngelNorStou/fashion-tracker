"use client";

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

type WardrobeFiltersProps = {
  search: string;
  setSearch: (value: string) => void;

  categories: Category[];
  categoryId: string;
  setCategoryId: (value: string) => void;

  color: string;
  setColor: (value: string) => void;

  tags: Tag[];
  tagId: string;
  setTagId: (value: string) => void;

  colors: string[];
};

export default function WardrobeFilters({
  search,
  setSearch,
  categories,
  categoryId,
  setCategoryId,
  color,
  setColor,
  colors,
  tags,
  tagId,
  setTagId,
}: WardrobeFiltersProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 lg:flex-row">
      {/* Search */}
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your wardrobe..."
          className="w-full rounded-xl border border-[#E3DACB] bg-[#FFFDF9] px-4 py-3 pl-11 text-sm text-[#17171C] outline-none placeholder:text-[#A69C8C] focus:border-[#9B7EA8]"
        />

        <svg
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69C8C]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
          />
        </svg>
      </div>

      {/* Category */}
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="rounded-xl border border-[#E3DACB] bg-white px-4 py-3 text-sm text-[#4B4B52] outline-none focus:border-[#9B7EA8]"
      >
        <option value="">All categories</option>

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

      {/* Color */}
      <select
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="rounded-xl border border-[#E3DACB] bg-white px-4 py-3 text-sm text-[#4B4B52] outline-none focus:border-[#9B7EA8]"
      >
        <option value="">All colors</option>

        {colors.map((colorOption) => (
          <option key={colorOption} value={colorOption}>
            {colorOption}
          </option>
        ))}
      </select>

      {/* Tags */}
      <select
        value={tagId}
        onChange={(e) => setTagId(e.target.value)}
        className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] px-4 py-3 text-sm text-[#4B4B52] outline-none focus:border-[#9B7EA8]"
      >
        <option value="">All tags</option>

        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
  );
}