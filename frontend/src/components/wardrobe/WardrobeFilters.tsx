"use client";

type WardrobeFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  categories: Category[];
  categoryId: string;
  setCategoryId: (value: string) => void;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

export default function WardrobeFilters({
  search,
  setSearch,
  categories,
  categoryId,
  setCategoryId,
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
          className="w-full rounded-xl border border-[#E3DACB] bg-[#FFFDF9] px-4 py-3 pl-11 text-sm text-[#2B2620] outline-none placeholder:text-[#A69C8C] focus:border-[#C1592F]"
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
          className="rounded-xl border border-[#E3DACB] bg-white px-4 py-3 text-sm text-[#5C5344] outline-none focus:border-[#C1592F]"
        >
          <option value="">
            All categories
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

      {/* Color */}
      <select
        className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] px-4 py-3 text-sm text-[#5C5344] outline-none focus:border-[#C1592F]"
        defaultValue=""
      >
        <option value="">All colors</option>
        <option value="black">Black</option>
        <option value="white">White</option>
        <option value="blue">Blue</option>
        <option value="red">Red</option>
        <option value="green">Green</option>
      </select>

      {/* Tags */}
      <select
        className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] px-4 py-3 text-sm text-[#5C5344] outline-none focus:border-[#C1592F]"
        defaultValue=""
      >
        <option value="">All tags</option>
        <option value="1">Casual</option>
        <option value="2">Formal</option>
        <option value="3">Summer</option>
        <option value="4">Winter</option>
      </select>

    </div>
  );
}