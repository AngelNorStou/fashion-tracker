"use client";

import { LayerEntry, ZONE_LABELS, imageUrlFor } from "@/lib/outfitZones";

export default function OutfitLayerOrderPanel({
  entries,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  entries: LayerEntry[];
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-4">
      <h3 className="text-sm font-semibold text-[#2B2620]">Layer order</h3>

      <p className="mt-1 text-xs text-[#8A8172]">
        Reorder items within their zone.
      </p>

      {entries.length === 0 ? (
        <p className="mt-4 text-xs text-[#A69C8C]">No items yet.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {entries.map((entry, idx) => {
            const imageUrl = imageUrlFor(entry.item);

            return (
              <div
                key={entry.item.id}
                className="flex items-center gap-2.5 rounded-lg border border-[#E3DACB] bg-white px-2.5 py-2"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#2B2620] text-[11px] font-semibold text-white">
                  {idx + 1}
                </span>

                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-[#EEE8DE]">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={entry.item.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#2B2620]">
                    {entry.item.name}
                  </p>

                  <p className="truncate text-[11px] text-[#8A8172]">
                    {ZONE_LABELS[entry.slot]}
                  </p>
                </div>

                <div className="flex flex-shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveUp(entry.item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D8CFC1] text-xs text-[#5C5344] hover:bg-[#F3EDE4]"
                    title="Move up"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() => onMoveDown(entry.item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D8CFC1] text-xs text-[#5C5344] hover:bg-[#F3EDE4]"
                    title="Move down"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(entry.item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D9B8A8] text-xs text-[#C1592F] hover:bg-[#F3E2D5]"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}