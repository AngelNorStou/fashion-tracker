"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import Pagination from "@/components/Pagination";
import {
  MannequinGender,
  OutfitGeneration,
  generatedImageUrlFor,
} from "@/lib/generation";

type OutfitOption = {
  outfitId: number;
  outfitName: string;
};

const ITEMS_PER_PAGE = 8;

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<OutfitGeneration[]>([]);
  const [outfitOptions, setOutfitOptions] = useState<OutfitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<MannequinGender | "">("");
  const [outfitId, setOutfitId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function loadGenerations() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (gender) params.set("gender", gender);
      if (outfitId) params.set("outfitId", outfitId);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const query = params.toString();
      const data = await apiFetch(
        `/api/generations${query ? `?${query}` : ""}`
      );

      setGenerations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your generation history."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadOutfitOptions() {
      try {
        const data = await apiFetch("/api/generations/outfits");
        setOutfitOptions(data);
      } catch (err) {
        console.error("Failed to load outfit options:", err);
      }
    }

    loadOutfitOptions();
  }, []);

  useEffect(() => {
    loadGenerations();
  }, [search, gender, outfitId, dateFrom, dateTo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, gender, outfitId, dateFrom, dateTo]);

  async function handleDelete(generation: OutfitGeneration) {
    const confirmed = window.confirm(
      `Delete this generated image of "${generation.outfitName}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(generation.id);

      await apiFetch(`/api/generations/${generation.id}`, {
        method: "DELETE",
      });

      setGenerations((current) =>
        current.filter((g) => g.id !== generation.id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this image."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(generations.length / ITEMS_PER_PAGE)
  );

  const paginatedGenerations = generations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters =
    search || gender || outfitId || dateFrom || dateTo;

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F7F3EC] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold text-[#17171C]">
            AI Generations
          </h1>

          <p className="mt-1 text-sm text-[#6B6B73]">
            Every AI outfit image you've generated.
          </p>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-4">
            <div className="min-w-[160px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-[#4B4B52]">
                Search by outfit name
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. weekend casual"
                className="w-full rounded-lg border border-[#E3DACB] bg-white px-3 py-2 text-sm text-[#17171C] outline-none placeholder:text-[#A69C8C] focus:border-[#9B7EA8]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#4B4B52]">
                Outfit
              </label>
              <select
                value={outfitId}
                onChange={(e) => setOutfitId(e.target.value)}
                className="rounded-lg border border-[#E3DACB] bg-white px-3 py-2 text-sm text-[#17171C] outline-none focus:border-[#9B7EA8]"
              >
                <option value="">All outfits</option>
                {outfitOptions.map((option) => (
                  <option key={option.outfitId} value={option.outfitId}>
                    {option.outfitName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#4B4B52]">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as MannequinGender | "")
                }
                className="rounded-lg border border-[#E3DACB] bg-white px-3 py-2 text-sm text-[#17171C] outline-none focus:border-[#9B7EA8]"
              >
                <option value="">All</option>
                <option value="FEMALE">Woman</option>
                <option value="MALE">Man</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#4B4B52]">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-[#E3DACB] bg-white px-3 py-2 text-sm text-[#17171C] outline-none focus:border-[#9B7EA8]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#4B4B52]">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-[#E3DACB] bg-white px-3 py-2 text-sm text-[#17171C] outline-none focus:border-[#9B7EA8]"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setGender("");
                  setOutfitId("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="rounded-lg border border-[#D8CFC1] px-3 py-2 text-sm text-[#4B4B52] hover:bg-[#F3EDE4]"
              >
                Clear
              </button>
            )}
          </div>

          {loading && (
            <p className="mt-8 text-sm text-[#6B6B73]">Loading...</p>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-xl border border-[#D9B8A8] bg-[#F3E2D5] px-5 py-4">
              <p className="text-sm text-[#9A4A25]">{error}</p>
            </div>
          )}

          {!loading && !error && generations.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-[#D8CFC1] bg-[#FFFDF9] px-6 py-16 text-center">
              <h3 className="text-lg font-medium text-[#17171C]">
                No generations found
              </h3>
              <p className="mt-2 text-sm text-[#6B6B73]">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Generate an AI preview from any of your outfits to see it here."}
              </p>
            </div>
          )}

          {!loading && !error && generations.length > 0 && (
            <>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedGenerations.map((generation) => {
                  const imageUrl = generatedImageUrlFor(generation);

                  return (
                    <div
                      key={generation.id}
                      className="overflow-hidden rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9]"
                    >
                      <div className="aspect-[4/5] bg-[#F3EDE4]">
                        {generation.status === "SUCCESS" && imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="Generated outfit"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                            <span
                              className={`text-xs font-medium ${
                                generation.status === "PENDING"
                                  ? "text-[#7E6389]"
                                  : "text-[#9A4A25]"
                              }`}
                            >
                              {generation.status === "PENDING"
                                ? "Pending"
                                : "Failed"}
                            </span>

                            {generation.errorMessage && (
                              <span className="mt-1 text-xs text-[#6B6B73]">
                                {generation.errorMessage}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <Link
                          href={`/outfits/${generation.outfitId}`}
                          className="truncate text-sm font-medium text-[#17171C] hover:text-[#9B7EA8]"
                        >
                          {generation.outfitName}
                        </Link>

                        <p className="mt-1 text-xs text-[#6B6B73]">
                          {new Date(generation.createdAt).toLocaleDateString()}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleDelete(generation)}
                          disabled={deletingId === generation.id}
                          className="mt-3 w-full rounded-lg border border-[#D8CFC1] px-3 py-1.5 text-xs font-medium text-[#7E6389] hover:border-[#9B7EA8] hover:bg-[#F1EAF4] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === generation.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}