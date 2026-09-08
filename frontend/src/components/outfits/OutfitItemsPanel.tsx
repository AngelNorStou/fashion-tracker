"use client";

import {
  LayerEntry,
  SlotKey,
  ZONE_ORDER,
  ZONE_LABELS,
  ZONE_ICONS,
} from "@/lib/outfitZones";

export default function OutfitItemsPanel({
  grouped,
  disabledZones,
  onAddClick,
  onRemoveItem,
}: {
  grouped: Record<SlotKey, LayerEntry[]>;
  disabledZones: Set<SlotKey>;
  onAddClick: (zone: SlotKey) => void;
  onRemoveItem: (itemId: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#FFFDF9] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#2B2620]">
        Outfit items
      </h3>

      <div>
        {ZONE_ORDER.map((zone) => {
          const entries = grouped[zone];
          const disabled = disabledZones.has(zone);
          const active = entries.length > 0;

          return (
            <div
              key={zone}
              className="border-b border-[#F0E9DC] py-2.5 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={`text-sm ${
                      active ? "text-[#C1592F]" : "text-[#C9BFAF]"
                    }`}
                  >
                    {ZONE_ICONS[zone]}
                  </span>

                  <span
                    className={`truncate text-sm ${
                      active
                        ? "font-medium text-[#C1592F]"
                        : "text-[#8A8172]"
                    }`}
                  >
                    {ZONE_LABELS[zone]}
                    {active && ` · ${entries.length}`}
                  </span>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onAddClick(zone)}
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-base leading-none text-[#8A8172] hover:bg-[#F3EDE4] hover:text-[#5C5344]"
                    title={`Add ${ZONE_LABELS[zone]}`}
                  >
                    +
                  </button>
                )}
              </div>

              {disabled && (
                <p className="mt-1.5 text-xs italic text-[#A69C8C]">
                  {zone === "full"
                    ? "Remove top & bottom items to add a dress or suit"
                    : "Disabled — covered by dress or suit"}
                </p>
              )}

              {active && (
                <div className="mt-1.5 space-y-1">
                    {entries
                      .slice()
                      .sort((a, b) => a.layerOrder - b.layerOrder)
                      .map((entry) => (
                        <div
                          key={entry.item.id}
                          className="flex items-center justify-between gap-2 pl-6"
                        >
                          <span className="truncate text-xs text-[#5C5344]">
                            {entry.item.name}
                          </span>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(entry.item.id)}
                            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#E8B8A4] bg-[#FBEEE6] text-xs font-medium leading-none text-[#C1592F] hover:border-[#C1592F] hover:bg-[#F3E2D5]"
                            title={`Remove ${entry.item.name}`}
                          >
                            ×
                          </button>
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