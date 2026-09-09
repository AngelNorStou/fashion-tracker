"use client";

import OutfitLayerSlot from "./OutfitLayerSlot";
import {
  LayerEntry,
  imageUrlFor,
  groupBySlot,
  getActiveBodyChain,
  BREADCRUMB_LABELS,
} from "@/lib/outfitZones";

export default function OutfitLayerPreview({
  entries,
  readOnly = false,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  entries: LayerEntry[];
  readOnly?: boolean;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
  onRemove?: (id: number) => void;
}) {
  const grouped = groupBySlot(entries);
  const hasFull = grouped.full.length > 0;
  const hasBag = grouped.bag.length > 0;

  if (entries.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-[#FFFDF9] p-4 text-center">
        <i className="fi fi-rr-t-shirt text-5xl text-[#C9BFAF]" aria-hidden="true"></i>

        <h4 className="mt-4 text-sm font-medium text-[#5C5344]">
          {readOnly ? "This outfit is empty" : "Start building your outfit"}
        </h4>

        {!readOnly && (
          <p className="mt-2 max-w-xs text-xs text-[#8A8172]">
            Select clothing items from your wardrobe to add them to this
            outfit.
          </p>
        )}
      </div>
    );
  }

  const chain = getActiveBodyChain(hasFull);

  const zoneHeights: Record<string, number> = {
    hat: 64,
    top: 150,
    belt: 32,
    bottom: 150,
    shoes: 80,
    full: 420,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-stretch justify-center gap-3">
        <div className="flex w-full max-w-xs flex-col gap-2">
          {chain.map((zone) => (
            <OutfitLayerSlot
              key={zone}
              zone={zone}
              entries={grouped[zone]}
              minHeightPx={zoneHeights[zone]}
              readOnly={readOnly}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onRemove={onRemove}
            />
          ))}
        </div>

        {hasBag && (
          <div className="flex w-32 flex-shrink-0 flex-col items-center">
            <OutfitLayerSlot
              zone="bag"
              entries={grouped.bag}
              minHeightPx={140}
              readOnly={readOnly}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onRemove={onRemove}
            />

            <span className="mt-1.5 text-[11px] text-[#8A8172]">Bag</span>
          </div>
        )}
      </div>

      {/* Breadcrumb trail describing the current body-zone chain */}
      <p className="text-center text-[11px] text-[#A69C8C]">
        {chain.map((z) => BREADCRUMB_LABELS[z]).join(" · ")}
      </p>

      {grouped.other.length > 0 && (
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8A8172]">
            Other accessories
          </span>

          <div className="flex flex-wrap gap-2">
            {grouped.other.map((entry) => (
              <div
                key={entry.item.id}
                className="flex items-center gap-2 rounded-full border border-[#E3DACB] bg-white py-1 pl-1 pr-3"
              >
                <div className="h-7 w-7 overflow-hidden rounded-full bg-[#EEE8DE]">
                  {imageUrlFor(entry.item) && (
                    <img
                      src={imageUrlFor(entry.item)!}
                      alt={entry.item.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <span className="text-xs text-[#2B2620]">
                  {entry.item.name}
                </span>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRemove?.(entry.item.id)}
                    className="text-xs text-[#C1592F]"
                    title={`Remove ${entry.item.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}