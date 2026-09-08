"use client";

import OutfitLayerSlot from "./OutfitLayerSlot";
import { LayerEntry, imageUrlFor, groupBySlot } from "@/lib/outfitZones";

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

  if (entries.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-[#C9BFAF] bg-[#FFFDF9] p-4 text-center">
        <div className="text-5xl">👕</div>

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

  return (
    <div className="space-y-4">
      <div className="flex items-stretch justify-center gap-3">
        {/* Body column: either the dress/suit stack (Hat -> Shoes -> Full)
            or the separates stack (Hat -> Top -> Belt -> Bottom -> Shoes).
            Full Outfit only ever shows up here, centered, never as a
            standalone side column. */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <OutfitLayerSlot
            label="Hat"
            icon="👒"
            entries={grouped.hat}
            minHeightPx={64}
            emptyText="No hat"
            readOnly={readOnly}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />

          {hasFull ? (
            <>
               <OutfitLayerSlot
                 label="Full outfit / Dress / Suit"
                 icon="👗"
                 entries={grouped.full}
                 minHeightPx={420}
                 emptyText="No dress or suit"
                 readOnly={readOnly}
                 onMoveUp={onMoveUp}
                 onMoveDown={onMoveDown}
                 onRemove={onRemove}
               />

               <OutfitLayerSlot
                 label="Shoes"
                 icon="👟"
                 entries={grouped.shoes}
                 minHeightPx={80}
                 emptyText="No shoes"
                 readOnly={readOnly}
                 onMoveUp={onMoveUp}
                 onMoveDown={onMoveDown}
                 onRemove={onRemove}
              />
            </>
          ) : (
            <>
              <OutfitLayerSlot
                label="Top"
                icon="👕"
                entries={grouped.top}
                minHeightPx={150}
                emptyText="No top"
                readOnly={readOnly}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onRemove={onRemove}
              />

              <OutfitLayerSlot
                label="Belt"
                icon="➖"
                entries={grouped.belt}
                minHeightPx={32}
                emptyText="No belt"
                readOnly={readOnly}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onRemove={onRemove}
              />

              <OutfitLayerSlot
                label="Bottom"
                icon="👖"
                entries={grouped.bottom}
                minHeightPx={150}
                emptyText="No bottom"
                readOnly={readOnly}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onRemove={onRemove}
              />

              <OutfitLayerSlot
                label="Shoes"
                icon="👟"
                entries={grouped.shoes}
                minHeightPx={80}
                emptyText="No shoes"
                readOnly={readOnly}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onRemove={onRemove}
              />
            </>
          )}
        </div>

        {/* Bags stay as their own side column in both layouts. */}
        <div className="flex w-40 flex-shrink-0 flex-col justify-center">
          <OutfitLayerSlot
            label="Bags"
            icon="👜"
            entries={grouped.bag}
            minHeightPx={180}
            emptyText="No bag"
            readOnly={readOnly}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />
        </div>
      </div>

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