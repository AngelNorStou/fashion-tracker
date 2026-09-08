"use client";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-[#D8CFC1] px-3 py-1.5 text-sm text-[#5C5344] hover:bg-[#F3EDE4] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Prev
      </button>

      <span className="text-sm text-[#8A8172]">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-[#D8CFC1] px-3 py-1.5 text-sm text-[#5C5344] hover:bg-[#F3EDE4] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}