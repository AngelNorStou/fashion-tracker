"use client";

import { useState } from "react";
import { LayerEntry, imageUrlFor } from "@/lib/outfitZones";

export default function OutfitLayerSlot({
  label,
  icon,
  entries,
  minHeightPx,
  emptyText,
  readOnly = false,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  label: string;
  icon: string;
  entries: LayerEntry[];
  minHeightPx: number;
  emptyText: string;
  readOnly?: boolean;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
  onRemove?: (id: number) => void;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Lowest layerOrder first in the DOM, so later (higher layerOrder,
  // more "on top") items paint after and sit above their neighbors by
  // default stacking order.
  const orderedEntries = [...entries].sort(
    (a, b) => a.layerOrder - b.layerOrder
  );

  // Cards scale with the zone's own height (minHeightPx) rather than a
  // fixed width, so a tall zone like "Full outfit" produces a large,
  // space-filling card instead of a small thumbnail lost in empty space.
  const cardHeight = minHeightPx - 24; // leaves room for the row's padding
  const overlap = Math.round(cardHeight * 0.35);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#8A8172]">
          {label}
        </span>

        {entries.length > 1 && (
          <span className="text-[10px] text-[#A69C8C]">
            {entries.length} layers
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#C9BFAF] bg-[#FFFDF9] text-center"
          style={{ height: minHeightPx }}
        >
          <span className="text-lg">{icon}</span>
          <span className="mt-1 text-[10px] text-[#A69C8C]">
            {emptyText}
          </span>
        </div>
      ) : (
        <div
          className="flex items-center overflow-x-auto rounded-xl border border-dashed border-[#C9BFAF] bg-[#FFFDF9] p-3"
          style={{ height: minHeightPx }}
        >
          {orderedEntries.map((entry, idx) => {
            const imageUrl = imageUrlFor(entry.item);
            const isHovered = hoveredId === entry.item.id;

            return (
              <div
                key={entry.item.id}
                onMouseEnter={() => setHoveredId(entry.item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative aspect-[4/5] flex-shrink-0 overflow-hidden rounded-lg border border-[#E3DACB] bg-white shadow-md transition-transform"
                style={{
                  height: cardHeight,
                  marginLeft: idx === 0 ? 0 : -overlap,
                  zIndex: isHovered ? 999 : idx,
                  transform: isHovered ? "translateY(-6px)" : undefined,
                }}
              >
                {/* Layer order badge */}
                <div className="absolute left-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B2620] text-xs font-semibold text-white">
                  {entry.layerOrder}
                </div>

                {/* Per-item controls, scoped to this zone */}
                {!readOnly && (
                  <div
                    className={`absolute right-1.5 top-1.5 z-10 flex gap-1 transition ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onMoveUp?.(entry.item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2B2620] text-xs text-white"
                      title={`Move ${entry.item.name} up a layer`}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => onMoveDown?.(entry.item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2B2620] text-xs text-white"
                      title={`Move ${entry.item.name} down a layer`}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove?.(entry.item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C1592F] text-xs text-white"
                      title={`Remove ${entry.item.name}`}
                    >
                      ×
                    </button>
                  </div>
                )}

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={entry.item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center">
                    <span className="text-xs text-[#A69C8C]">
                      {entry.item.name}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-1.5">
                  <p className="truncate text-xs font-medium text-white">
                    {entry.item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}