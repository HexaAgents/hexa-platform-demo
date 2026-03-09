import { LineItem } from "@/lib/types";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { AlertCircle, Package, ArrowRight } from "lucide-react";

export function LineItemCard({ item }: { item: LineItem }) {
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
            {item.parsedSku || "---"}
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
            {item.parsedUnitPrice != null
              ? `$${item.parsedUnitPrice.toFixed(2)}`
              : "---"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Confidence:</span>{" "}
          <ConfidenceBar value={item.confidence} />
        </div>
      </div>

      {item.matchedCatalogItems.length > 0 && (
        <div className="mb-3 space-y-2">
          {item.matchedCatalogItems.map((cat, i) => (
            <div
              key={i}
              className="flex items-start gap-2 border border-dashed border-border bg-muted/30 px-3 py-2 text-[13px]"
            >
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-foreground/85">
                    {cat.catalogName}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({cat.catalogSku})
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {cat.catalogDescription}
                </p>
                <p className="mt-0.5 text-[12px] text-foreground/70">
                  ${cat.catalogPrice.toFixed(2)} / {cat.catalogUom}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

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
