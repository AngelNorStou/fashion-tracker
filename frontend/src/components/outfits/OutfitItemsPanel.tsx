"use client";

import {
  LayerEntry,
  SlotKey,
  ZONE_ORDER,
  ZONE_LABELS,
  ZONE_ICONS,
  imageUrlFor,
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
    <div className="rounded-2xl border border-[#D8CFC1] bg-[#FFFDF9] p-4">
      <h3 className="mb-4 text-sm font-semibold text-[#2B2620]">
        Outfit items
      </h3>

      <div className="space-y-1">
        {ZONE_ORDER.map((zone) => {
          const entries = grouped[zone];
          const disabled = disabledZones.has(zone);

          return (
            <div
              key={zone}
              className="border-b border-[#EFE8DA] py-3 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-base">{ZONE_ICONS[zone]}</span>

                  <span className="truncate text-sm font-medium text-[#2B2620]">
                    {ZONE_LABELS[zone]}
                  </span>

                  {entries.length > 1 && (
                    <span className="flex-shrink-0 text-xs text-[#A69C8C]">
                      {entries.length} layers
                    </span>
                  )}
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onAddClick(zone)}
                    className="flex-shrink-0 rounded-lg border border-[#D8CFC1] px-2.5 py-1 text-xs font-medium text-[#5C5344] hover:bg-[#F3EDE4]"
                  >
                    + Add
                  </button>
                )}
              </div>

              {disabled ? (
                <p className="mt-2 text-xs italic text-[#A69C8C]">
                  {zone === "full"
                    ? "Remove top & bottom items to add a dress or suit"
                    : "Disabled — covered by dress or suit"}
                </p>
              ) : entries.length === 0 ? (
                <p className="mt-2 text-xs text-[#A69C8C]">
                  No {ZONE_LABELS[zone].toLowerCase()}
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {entries.map((entry) => {
                    const imageUrl = imageUrlFor(entry.item);

                    return (
                      <div
                        key={entry.item.id}
                        className="flex items-center gap-2.5 rounded-lg bg-[#F7F3EC] px-2 py-1.5"
                      >
                        {entries.length > 1 && (
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#2B2620] text-[10px] font-semibold text-white">
                            {entry.layerOrder}
                          </span>
                        )}

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
                            {entry.item.categoryName}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(entry.item.id)}
                          className="flex-shrink-0 text-xs text-[#C1592F] hover:text-[#9A4A25]"
                          title={`Remove ${entry.item.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}