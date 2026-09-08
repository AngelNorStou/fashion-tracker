"use client";

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
  const offset = 14;
  const stackHeight =
    minHeightPx + (entries.length > 1 ? (entries.length - 1) * offset : 0);

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

      <div
        className="relative rounded-xl border border-dashed border-[#C9BFAF] bg-[#FFFDF9]"
        style={{ height: stackHeight }}
      >
        {entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-lg">{icon}</span>
            <span className="mt-1 text-[10px] text-[#A69C8C]">
              {emptyText}
            </span>
          </div>
        ) : (
          entries.map((entry, idx) => {
            const imageUrl = imageUrlFor(entry.item);

            return (
              <div
                key={entry.item.id}
                className="group/layer absolute overflow-hidden rounded-lg border border-[#E3DACB] bg-white shadow-sm"
                style={{
                  top: idx * offset,
                  left: idx * offset,
                  right: (entries.length - 1 - idx) * offset,
                  bottom: 0,
                  zIndex: idx + 1,
                }}
              >
                <div className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#2B2620] text-[10px] font-semibold text-white">
                  {entry.layerOrder}
                </div>

                {!readOnly && (
                  <div className="absolute right-1 top-1 z-10 flex gap-1 opacity-0 transition group-hover/layer:opacity-100">
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
                    <span className="text-[10px] text-[#A69C8C]">
                      {entry.item.name}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1">
                  <p className="truncate text-[10px] font-medium text-white">
                    {entry.item.name}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}