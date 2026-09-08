"use client";

import {
  LayerEntry,
  SlotKey,
  ZONE_ORDER,
  ZONE_LABELS,
} from "@/lib/outfitZones";

export default function OutfitLayerOrderPanel({
  grouped,
  onMoveUp,
  onMoveDown,
}: {
  grouped: Record<SlotKey, LayerEntry[]>;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
}) {
  const zonesToShow = ZONE_ORDER.filter(
    (zone) => zone !== "other" && grouped[zone] !== undefined
  );

  return (
    <div className="rounded-2xl bg-[#FFFDF9] p-4">
      <h3 className="text-sm font-semibold text-[#2B2620]">Layer order</h3>

      <p className="mt-1 text-xs text-[#8A8172]">
        Reorder items within each zone.
      </p>

      <div className="mt-4 space-y-4">
        {zonesToShow.map((zone) => {
          const entries = [...grouped[zone]].sort(
            (a, b) => a.layerOrder - b.layerOrder
          );

          if (entries.length === 0 && zone !== "top" && zone !== "bottom") {
            // Only surface empty placeholders for the zones that are
            // typically part of the outfit chain being built, to avoid
            // a long list of "No X added" for every possible zone.
            return null;
          }

          return (
            <div key={zone}>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#A69C8C]">
                {ZONE_LABELS[zone]}
              </span>

              {entries.length === 0 ? (
                <p className="mt-1 text-xs text-[#C9BFAF]">
                  No {ZONE_LABELS[zone].toLowerCase()} added.
                </p>
              ) : (
                <div className="mt-1 space-y-1">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.item.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate text-sm text-[#2B2620]">
                        {idx + 1}. {entry.item.name}
                      </span>

                      {entries.length > 1 && (
                        <div className="flex flex-shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => onMoveUp(entry.item.id)}
                            className="text-sm text-[#8A8172] hover:text-[#5C5344]"
                            title="Move up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() => onMoveDown(entry.item.id)}
                            className="text-sm text-[#8A8172] hover:text-[#5C5344]"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}