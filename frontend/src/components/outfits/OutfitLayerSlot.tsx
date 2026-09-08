"use client";

import { useState } from "react";
import { LayerEntry, ZONE_ICONS, imageUrlFor } from "@/lib/outfitZones";

export default function OutfitLayerSlot({
  zone,
  entries,
  minHeightPx,
  readOnly = false,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  zone: keyof typeof ZONE_ICONS;
  entries: LayerEntry[];
  minHeightPx: number;
  readOnly?: boolean;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
  onRemove?: (id: number) => void;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const orderedEntries = [...entries].sort(
    (a, b) => a.layerOrder - b.layerOrder
  );

  // Small fixed overlap in px, not derived from card size — flexbox
  // below distributes the remaining width evenly across however many
  // cards there are, so the row always fits its container exactly and
  // never needs to scroll, regardless of item count or zone height.
  const overlap = 18;

  if (entries.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl bg-[#FFFDF9]"
        style={{ height: minHeightPx }}
      >
        <span className="text-3xl text-[#E3DACB]" aria-hidden>
          {ZONE_ICONS[zone]}
        </span>
        <span className="sr-only">No {zone} added</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-stretch overflow-hidden rounded-2xl bg-[#FFFDF9] p-2"
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
            className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-[#EFE8DA] bg-white shadow-sm transition-transform"
            style={{
              marginLeft: idx === 0 ? 0 : -overlap,
              zIndex: isHovered ? 999 : idx,
              transform: isHovered ? "translateY(-6px)" : undefined,
            }}
          >
            <div className="absolute left-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2B2620] text-xs font-semibold text-white">
              {entry.layerOrder}
            </div>

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
  );
}