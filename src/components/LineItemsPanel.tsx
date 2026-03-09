import { LineItem, MatchStatus } from "@/lib/types";
import { LineItemCard } from "./LineItemCard";

function countByStatus(items: LineItem[]): Record<MatchStatus, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.matchStatus]++;
      return acc;
    },
    { confirmed: 0, partial: 0, conflict: 0, unmatched: 0 } as Record<
      MatchStatus,
      number
    >
  );
}

export function LineItemsPanel({ items }: { items: LineItem[] }) {
  const counts = countByStatus(items);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Parsed Line Items
        </h3>
        <span className="text-[13px] text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {counts.confirmed > 0 && (
          <span className="bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            {counts.confirmed} confirmed
          </span>
        )}
        {counts.partial > 0 && (
          <span className="bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
            {counts.partial} partial
          </span>
        )}
        {counts.conflict > 0 && (
          <span className="bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
            {counts.conflict} conflict
          </span>
        )}
        {counts.unmatched > 0 && (
          <span className="bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-700">
            {counts.unmatched} unmatched
          </span>
        )}
      </div>

      <div className="space-y-3">
        {items
          .sort((a, b) => a.lineNumber - b.lineNumber)
          .map((item) => (
            <LineItemCard key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
}
