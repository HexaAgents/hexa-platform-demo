"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronDown, Check, Star, X } from "lucide-react";
import { CatalogItem, MatchStatus } from "@/lib/types";
import { skuCatalog, type SkuCatalogEntry } from "@/lib/sku-catalog";

interface SkuSelectorProps {
  matchStatus: MatchStatus;
  selectedItem: CatalogItem | null;
  recommendedItems: CatalogItem[];
  onSelect: (item: CatalogItem) => void;
}

export function SkuSelector({
  matchStatus,
  selectedItem,
  recommendedItems,
  onSelect,
}: SkuSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(ev: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(ev.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    function handleEscape(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const recommendedSkus = useMemo(
    () => new Set(recommendedItems.map((r) => r.catalogSku)),
    [recommendedItems]
  );

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) return skuCatalog;
    const q = search.toLowerCase();
    return skuCatalog.filter(
      (item) =>
        item.catalogSku.toLowerCase().includes(q) ||
        item.catalogName.toLowerCase().includes(q) ||
        item.catalogDescription.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  const filteredRecommended = useMemo(() => {
    if (!search.trim()) return recommendedItems;
    const q = search.toLowerCase();
    return recommendedItems.filter(
      (item) =>
        item.catalogSku.toLowerCase().includes(q) ||
        item.catalogName.toLowerCase().includes(q) ||
        item.catalogDescription.toLowerCase().includes(q)
    );
  }, [search, recommendedItems]);

  const otherItems = useMemo(
    () => filteredCatalog.filter((item) => !recommendedSkus.has(item.catalogSku)),
    [filteredCatalog, recommendedSkus]
  );

  const handleSelect = useCallback(
    (item: CatalogItem | SkuCatalogEntry) => {
      const { catalogSku, catalogName, catalogDescription, catalogPrice, catalogUom } = item;
      onSelect({ catalogSku, catalogName, catalogDescription, catalogPrice, catalogUom });
      setIsOpen(false);
      setSearch("");
    },
    [onSelect]
  );

  const borderColor = {
    confirmed: "border-emerald-500/30",
    partial: "border-amber-500/40",
    conflict: "border-orange-500/40",
    unmatched: "border-red-500/40",
  }[matchStatus];

  const bgHint = {
    confirmed: "bg-emerald-500/5",
    partial: "bg-amber-500/5",
    conflict: "bg-orange-500/5",
    unmatched: "bg-red-500/5",
  }[matchStatus];

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-start gap-2.5 border border-dashed ${borderColor} ${bgHint} px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5`}
      >
        {selectedItem ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="text-[13px] font-medium text-foreground/85">
                {selectedItem.catalogName}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                ({selectedItem.catalogSku})
              </span>
            </div>
            <p className="mt-0.5 pl-5 text-[12px] text-foreground/60">
              ${selectedItem.catalogPrice.toFixed(2)} / {selectedItem.catalogUom}
            </p>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-[13px] text-foreground/60">
                {matchStatus === "unmatched"
                  ? "Search & assign a SKU"
                  : matchStatus === "conflict"
                    ? "Resolve SKU conflict"
                    : "Select the correct SKU"}
              </span>
              {recommendedItems.length > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  &middot; {recommendedItems.length} suggested
                </span>
              )}
            </div>
          </div>
        )}
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown ───────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-border bg-card shadow-lg">
          {/* Search bar */}
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 border border-border bg-background px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                placeholder="Search by SKU, name, category, material..."
                className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list */}
          <div className="max-h-[280px] overflow-y-auto overscroll-contain">
            {/* Recommended section */}
            {filteredRecommended.length > 0 && (
              <div>
                <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-amber-200/60 bg-amber-50 px-3 py-1.5 dark:border-amber-500/20 dark:bg-amber-950/80">
                  <Star className="h-3 w-3 text-amber-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    Suggested Matches
                  </span>
                </div>
                {filteredRecommended.map((item) => (
                  <SkuOptionRow
                    key={item.catalogSku}
                    sku={item.catalogSku}
                    name={item.catalogName}
                    description={item.catalogDescription}
                    price={item.catalogPrice}
                    uom={item.catalogUom}
                    isSelected={selectedItem?.catalogSku === item.catalogSku}
                    isRecommended
                    onSelect={() => handleSelect(item)}
                  />
                ))}
              </div>
            )}

            {/* All products header */}
            <div className="sticky top-0 z-10 border-y border-border bg-card px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                All Products
                {search.trim() ? (
                  <span className="ml-1 font-normal">
                    ({otherItems.length} result{otherItems.length !== 1 ? "s" : ""})
                  </span>
                ) : (
                  <span className="ml-1 font-normal">
                    ({skuCatalog.length - recommendedSkus.size})
                  </span>
                )}
              </span>
            </div>

            {otherItems.length > 0 ? (
              otherItems.map((item) => (
                <SkuOptionRow
                  key={item.catalogSku}
                  sku={item.catalogSku}
                  name={item.catalogName}
                  description={item.catalogDescription}
                  price={item.catalogPrice}
                  uom={item.catalogUom}
                  category={item.category}
                  isSelected={selectedItem?.catalogSku === item.catalogSku}
                  onSelect={() => handleSelect(item)}
                />
              ))
            ) : (
              <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
                No products match &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SkuOptionRow({
  sku,
  name,
  description,
  price,
  uom,
  category,
  isSelected,
  isRecommended,
  onSelect,
}: {
  sku: string;
  name: string;
  description: string;
  price: number;
  uom: string;
  category?: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-2.5 border-b border-border px-3 py-2 text-left transition-colors ${
        isSelected
          ? "bg-primary/10"
          : isRecommended
            ? "bg-amber-50/60 hover:bg-amber-100/70 dark:bg-amber-500/5 dark:hover:bg-amber-500/10"
            : "hover:bg-accent/60"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 font-mono text-[11px] font-medium text-foreground/80">
            {sku}
          </span>
          <span className="text-[10px] text-muted-foreground/50">&middot;</span>
          <span className="truncate text-[12px] text-foreground/75">
            {name}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          {category && (
            <span className="text-[10px] text-muted-foreground/70">
              {category}
            </span>
          )}
          <span className="truncate text-[10px] text-muted-foreground/50">
            {description.length > 60
              ? description.slice(0, 60) + "…"
              : description}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-right text-[11px] font-medium text-foreground/70">
          ${price.toFixed(2)}
          <span className="text-[9px] font-normal text-muted-foreground">
            /{uom}
          </span>
        </span>
        {isSelected && (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        )}
      </div>
    </button>
  );
}
