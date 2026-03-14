"use client";

import { useState, useMemo } from "react";
import { LineItem, CatalogItem, MatchStatus } from "@/lib/types";
import { LineItemCard } from "./LineItemCard";

const STATUS_PRIORITY: Record<MatchStatus, number> = {
  unmatched: 0,
  conflict: 1,
  partial: 2,
  confirmed: 3,
};

const FILTER_CONFIG: {
  status: MatchStatus;
  label: string;
  bg: string;
  bgActive: string;
  text: string;
  ring: string;
}[] = [
  {
    status: "unmatched",
    label: "unmatched",
    bg: "bg-red-500/10",
    bgActive: "bg-red-500/20 ring-1",
    text: "text-red-700",
    ring: "ring-red-500/40",
  },
  {
    status: "conflict",
    label: "conflict",
    bg: "bg-orange-500/10",
    bgActive: "bg-orange-500/20 ring-1",
    text: "text-orange-700",
    ring: "ring-orange-500/40",
  },
  {
    status: "partial",
    label: "partial",
    bg: "bg-amber-500/10",
    bgActive: "bg-amber-500/20 ring-1",
    text: "text-amber-700",
    ring: "ring-amber-500/40",
  },
  {
    status: "confirmed",
    label: "confirmed",
    bg: "bg-emerald-500/10",
    bgActive: "bg-emerald-500/20 ring-1",
    text: "text-emerald-700",
    ring: "ring-emerald-500/40",
  },
];

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

interface LineItemsPanelProps {
  items: LineItem[];
  resolutions?: Record<string, CatalogItem>;
  onResolve?: (lineItemId: string, catalogItem: CatalogItem) => void;
  onAddClarification?: (lineItemId: string, question: string) => void;
  clarificationAddedIds?: Set<string>;
}

export function LineItemsPanel({
  items,
  resolutions,
  onResolve,
  onAddClarification,
  clarificationAddedIds,
}: LineItemsPanelProps) {
  const counts = countByStatus(items);
  const [activeFilter, setActiveFilter] = useState<MatchStatus | null>(null);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          STATUS_PRIORITY[a.matchStatus] - STATUS_PRIORITY[b.matchStatus] ||
          a.lineNumber - b.lineNumber
      ),
    [items]
  );

  const filteredItems = activeFilter
    ? sortedItems.filter((item) => item.matchStatus === activeFilter)
    : sortedItems;

  const handleFilterClick = (status: MatchStatus) => {
    setActiveFilter((prev) => (prev === status ? null : status));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Parsed Line Items
        </h3>
        <span className="text-[13px] text-muted-foreground">
          {activeFilter
            ? `${filteredItems.length} of ${items.length} items`
            : `${items.length} item${items.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_CONFIG.map(({ status, label, bg, bgActive, text, ring }) =>
          counts[status] > 0 ? (
            <button
              key={status}
              type="button"
              onClick={() => handleFilterClick(status)}
              className={`px-2.5 py-0.5 text-[11px] font-medium transition-all ${text} ${
                activeFilter === status ? `${bgActive} ${ring}` : bg
              } hover:opacity-80`}
            >
              {counts[status]} {label}
            </button>
          ) : null
        )}
        {activeFilter && (
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className="px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <LineItemCard
            key={item.id}
            item={item}
            resolvedCatalogItem={
              resolutions ? (resolutions[item.id] ?? null) : undefined
            }
            onResolve={
              onResolve ? (ci) => onResolve(item.id, ci) : undefined
            }
            onAddClarification={onAddClarification}
            addedToClarification={clarificationAddedIds?.has(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
