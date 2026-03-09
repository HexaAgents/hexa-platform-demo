"use client";

import { useState } from "react";
import { LineItem, CatalogItem } from "@/lib/types";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { AlertCircle } from "lucide-react";
import { SkuSelector } from "./SkuSelector";

export function LineItemCard({ item }: { item: LineItem }) {
  const [selectedCatalogItem, setSelectedCatalogItem] =
    useState<CatalogItem | null>(
      item.matchStatus === "confirmed" && item.matchedCatalogItems.length > 0
        ? item.matchedCatalogItems[0]
        : null
    );

  const displaySku = selectedCatalogItem?.catalogSku ?? item.parsedSku;
  const displayPrice = selectedCatalogItem?.catalogPrice ?? item.parsedUnitPrice;

  return (
    <div className="border border-border bg-background/30 p-4 transition-colors hover:border-primary/60 hover:bg-primary/5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-[11px] font-medium text-muted-foreground">
            {item.lineNumber}
          </span>
          <h4 className="text-[13px] font-semibold text-foreground/85">
            {item.parsedProductName}
          </h4>
        </div>
        <MatchStatusBadge status={item.matchStatus} />
      </div>

      <div className="mb-3 border border-border bg-muted/50 px-3 py-2">
        <p className="font-mono text-[11px] text-muted-foreground">
          &quot;{item.rawText}&quot;
        </p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
        <div>
          <span className="text-muted-foreground">SKU:</span>{" "}
          <span className="font-medium font-mono text-foreground/85">
            {displaySku || "---"}
          </span>
        </div>
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
          <span className="text-muted-foreground">Confidence:</span>{" "}
          <ConfidenceBar value={item.confidence} />
        </div>
      </div>

      <div className="mb-3">
        <SkuSelector
          matchStatus={item.matchStatus}
          selectedItem={selectedCatalogItem}
          recommendedItems={item.matchedCatalogItems}
          onSelect={setSelectedCatalogItem}
        />
      </div>

      {item.issues.length > 0 && (
        <div className="space-y-1.5">
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
