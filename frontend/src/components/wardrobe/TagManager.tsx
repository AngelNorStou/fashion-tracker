"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Tag = {
  id: number;
  name: string;
};

type TagManagerProps = {
  tags: Tag[];
  onTagsChanged: () => Promise<void>;
  onClose: () => void;
};

export default function TagManager({
  tags,
  onTagsChanged,
  onClose,
}: TagManagerProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiFetch("/api/tags", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      setName("");

      await onTagsChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create tag."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(tag: Tag) {
    const confirmed = window.confirm(
      `Delete the tag "${tag.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiFetch(`/api/tags/${tag.id}`, {
        method: "DELETE",
      });

      await onTagsChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete tag."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2620]/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFDF9] p-6 shadow-xl">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#2B2620]">
            Manage tags
          </h2>

          <p className="mt-1 text-sm text-[#8A8172]">
            Create and manage the tags you use for your wardrobe.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#D9B8A8] bg-[#F3E2D5] px-4 py-3 text-sm text-[#9A4A25]">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-[#5C5344]">
            Create a tag
          </label>

          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
              placeholder="e.g. Casual"
              className="min-w-0 flex-1 rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C1592F]"
            />

            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="rounded-lg bg-[#C1592F] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#9A4A25] disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-[#5C5344]">
            Your tags
          </h3>

          {tags.length === 0 ? (
            <p className="text-sm text-[#8A8172]">
              You haven't created any tags yet.
            </p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-lg border border-[#E3DACB] bg-white px-3 py-2.5"
                >
                  <span className="text-sm text-[#2B2620]">
                    {tag.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(tag)}
                    disabled={loading}
                    className="text-sm font-medium text-[#9A4A25] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-[#EEE7DC] pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#D8CFC1] px-4 py-2.5 text-sm font-medium text-[#5C5344] hover:bg-[#F3EDE4]"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}