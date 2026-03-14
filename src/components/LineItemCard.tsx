"use client";

import { useState } from "react";
import { LineItem, CatalogItem } from "@/lib/types";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { AlertCircle, MessageSquarePlus, Check } from "lucide-react";
import { SkuSelector } from "./SkuSelector";

interface LineItemCardProps {
  item: LineItem;
  resolvedCatalogItem?: CatalogItem | null;
  onResolve?: (catalogItem: CatalogItem) => void;
  onAddClarification?: (lineItemId: string, question: string) => void;
  addedToClarification?: boolean;
}

export function LineItemCard({
  item,
  resolvedCatalogItem,
  onResolve,
  onAddClarification,
  addedToClarification,
}: LineItemCardProps) {
  const [internalSelected, setInternalSelected] =
    useState<CatalogItem | null>(
      item.matchStatus === "confirmed" && item.matchedCatalogItems.length > 0
        ? item.matchedCatalogItems[0]
        : null
    );

  const isControlled = resolvedCatalogItem !== undefined;
  const selectedCatalogItem = isControlled
    ? resolvedCatalogItem
    : internalSelected;

  const handleSelect = (ci: CatalogItem) => {
    if (onResolve) onResolve(ci);
    if (!isControlled) setInternalSelected(ci);
  };

  const displaySku = selectedCatalogItem?.catalogSku ?? item.parsedSku;
  const displayPrice = selectedCatalogItem?.catalogPrice ?? item.parsedUnitPrice;

  const isConfirmed = item.matchStatus === "confirmed";
  const needsAction = item.matchStatus !== "confirmed";
  const skuAlreadyShownInSelector = !!selectedCatalogItem;

  return (
    <div
      className={`border p-4 transition-colors ${
        isConfirmed
          ? "border-border/60 bg-muted/20 opacity-80"
          : "border-border bg-background/30 hover:border-primary/60 hover:bg-primary/5"
      }`}
    >
      <div className={`${isConfirmed ? "mb-2" : "mb-3"} flex items-start justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-[11px] font-medium text-muted-foreground">
            {item.lineNumber}
          </span>
          <h4 className="text-[13px] font-semibold text-foreground/85">
            {item.parsedProductName}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {needsAction && onAddClarification && (
            addedToClarification ? (
              <span className="inline-flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <Check className="h-3 w-3" />
                In email
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const question = buildClarificationQuestion(item);
                  onAddClarification(item.id, question);
                }}
                className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-700"
              >
                <MessageSquarePlus className="h-3 w-3" />
                Ask customer
              </button>
            )
          )}
          <MatchStatusBadge status={item.matchStatus} />
        </div>
      </div>

      {needsAction && (
        <div className="mb-3 border border-border bg-muted/50 px-3 py-2">
          <p className="font-mono text-[11px] text-muted-foreground">
            &quot;{item.rawText}&quot;
          </p>
        </div>
      )}

      <div className={`${isConfirmed ? "mb-2" : "mb-3"} grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]`}>
        {!skuAlreadyShownInSelector && (
          <div>
            <span className="text-muted-foreground">SKU:</span>{" "}
            <span className="font-medium font-mono text-foreground/85">
              {displaySku || "---"}
            </span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Qty:</span>{" "}
          <span className="font-medium text-foreground/85">
            {item.parsedQuantity} {item.parsedUom}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Unit Price:</span>{" "}
          <span className="font-medium text-foreground/85">
            {displayPrice != null ? `$${displayPrice.toFixed(2)}` : "---"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Due:</span>{" "}
          <span className="font-medium text-foreground/85">
            {item.requestedDueDate || "---"}
          </span>
        </div>
        {needsAction && (
          <div>
            <span className="text-muted-foreground">Confidence:</span>{" "}
            <ConfidenceBar value={item.confidence} />
          </div>
        )}
      </div>

      <div className={isConfirmed ? "mb-0" : "mb-3"}>
        <SkuSelector
          matchStatus={item.matchStatus}
          selectedItem={selectedCatalogItem}
          recommendedItems={item.matchedCatalogItems}
          onSelect={handleSelect}
        />
      </div>

      {item.issues.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {item.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px]">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span className="text-muted-foreground">{issue}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function buildClarificationQuestion(item: LineItem): string {
  const prefix = `Line ${item.lineNumber} (${item.parsedProductName})`;

  if (item.matchStatus === "conflict" && item.matchedCatalogItems.length > 1) {
    const options = item.matchedCatalogItems
      .map((ci) => `${ci.catalogSku} — ${ci.catalogName}`)
      .join("; ");
    return `${prefix}: Multiple matching products found. Could you confirm which one you need? Options: ${options}`;
  }

  if (item.matchStatus === "unmatched") {
    return `${prefix}: We could not find this product in our catalog. Could you provide the exact part number or product name?`;
  }

  if (item.issues.length > 0) {
    return `${prefix}: ${item.issues[0]}`;
  }

  return `${prefix}: Could you provide more details to help us identify the correct product?`;
}

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 90
      ? "bg-emerald-500"
      : value >= 60
        ? "bg-amber-500"
        : value >= 30
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-[4px] w-16 bg-muted">
        <span
          className={`block h-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="text-[12px] font-medium text-foreground/85">
        {value}%
      </span>
    </span>
  );
}
