"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  getOpportunity,
  getSupplier,
  getSupplierPerformance,
  metricLabels,
  eventTypeLabels,
} from "@/data/sla-data";
import type { Status } from "@/data/sla-data";
import {
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Mail,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GenerateClaimPanel from "@/components/claims/GenerateClaimPanel";

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opp = getOpportunity(params.id as string);
  const supplier = opp ? getSupplier(opp.supplierId) : undefined;

  const [status, setStatus] = useState<Status>(opp?.status ?? "OPEN");
  const [generateClaimOpen, setGenerateClaimOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGenerateClaimOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!opp || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Opportunity not found</p>
        <Button variant="outline" onClick={() => router.push("/claims")}>
          Return to Claims Queue
        </Button>
      </div>
    );
  }

  const statusLabels: Record<Status, string> = {
    OPEN: "Open",
    SENT: "Sent",
    ACKNOWLEDGED: "Acknowledged",
    CREDITED: "Recovered",
    CLOSED: "Closed",
  };

  const performance = getSupplierPerformance(supplier.id);
  const oppMonth = new Date(opp.createdAt).toLocaleString("en-GB", { month: "short", year: "numeric" });
  const monthStats = performance.find((p) => p.month === oppMonth);
  const actionsDisabled = status === "CREDITED" || status === "CLOSED";

  return (
    <div className="flex flex-col w-full">
      {/* Header — matches Orders/ItemDetailPanel */}
      <div className="flex items-start justify-between border-b border-border bg-card px-7 py-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-1">
            <Link href="/claims" className="hover:text-foreground transition-colors">
              Claims
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{opp.poNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[22px] font-medium leading-none text-foreground">
              {opp.poNumber}
            </h1>
            <span
              className={cn(
                "text-[12px] font-medium",
                status === "OPEN" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {statusLabels[status]}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            <Link href={`/suppliers/${supplier.id}`} className="hover:text-foreground">
              {supplier.name}
            </Link>
            {" · "}
            {metricLabels[opp.metric]}
            {" · "}
            {new Date(opp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-muted-foreground">Credit</p>
          <p className="text-xl font-semibold text-foreground">£{opp.creditAmount.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {opp.recommendation === "CLAIM" ? "Recommended" : opp.recommendation === "DO_NOT_CLAIM" ? "Not recommended" : "Needs review"}
            {" · "}
            {opp.confidence} confidence
          </p>
        </div>
      </div>

      <div className="px-7 pb-8 pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Context — card styling */}
            {monthStats && (
              <div className="border border-border bg-card p-6 shadow-sm">
                <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Performance Context · {oppMonth}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Shipments</p>
                    <p className="font-medium text-foreground mt-0.5">{monthStats.totalShipments}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total Units</p>
                    <p className="font-medium text-foreground mt-0.5">{monthStats.totalUnits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total Value</p>
                    <p className="font-medium text-foreground mt-0.5">£{monthStats.totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Monthly {metricLabels[opp.metric]}</p>
                    <p
                      className={cn(
                        "font-mono font-medium mt-0.5",
                        opp.metric === "ON_TIME_DELIVERY" && monthStats.onTimeDelivery < 90 && "text-destructive",
                        opp.metric === "FILL_RATE" && monthStats.fillRate < 95 && "text-destructive"
                      )}
                    >
                      {opp.metric === "QUALITY_PPM"
                        ? `${monthStats.qualityPpm} PPM`
                        : opp.metric === "RESPONSE_TIME_HOURS"
                          ? `${monthStats.avgResponseHours}h`
                          : `${opp.metric === "ON_TIME_DELIVERY" ? monthStats.onTimeDelivery : monthStats.fillRate}%`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Breach Details */}
            <div className="border border-border bg-card p-6 shadow-sm">
              <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Breach Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-[13px]">
                <div>
                  <p className="text-[11px] text-muted-foreground">Metric</p>
                  <p className="font-medium mt-0.5">{metricLabels[opp.metric]}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Threshold</p>
                  <p className="font-mono mt-0.5">{opp.metric === "QUALITY_PPM" ? `≤${opp.threshold}` : `≥${opp.threshold}%`}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Actual</p>
                  <p className="font-mono mt-0.5">
                    {opp.actualValue > 0
                      ? opp.metric === "QUALITY_PPM"
                        ? opp.actualValue
                        : `${opp.actualValue}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Margin</p>
                  <p className="mt-0.5">{opp.breachMargin}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Units Ordered</p>
                  <p className="font-mono mt-0.5">{opp.qtyOrdered.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Units Received</p>
                  <p className={cn("font-mono mt-0.5", opp.qtyReceived < opp.qtyOrdered && "text-destructive")}>
                    {opp.qtyReceived > 0 ? opp.qtyReceived.toLocaleString() : "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Invoice Value</p>
                  <p className="font-mono mt-0.5">£{opp.invoiceValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Unit Price</p>
                  <p className="font-mono mt-0.5">
                    {opp.qtyOrdered > 1 ? `£${(opp.invoiceValue / opp.qtyOrdered).toFixed(2)}` : "—"}
                  </p>
                </div>
              </div>
              <div className="border-t border-border mt-4 pt-4">
                <p className="text-[13px] text-muted-foreground leading-relaxed">{opp.breachSummary}</p>
              </div>
            </div>

            {/* Analysis */}
            <div className="border border-border bg-card p-6 shadow-sm">
              <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Analysis
              </h4>
              <ul className="space-y-2">
                {opp.rationale.map((r, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-muted-foreground">
                    <span className="text-muted-foreground/50 select-none">—</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border mt-4 pt-4 text-[13px]">
                <span className="text-[11px] text-muted-foreground">Rule: </span>
                <span className="text-muted-foreground">{opp.ruleDescription}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-border bg-card shadow-sm">
              <h4 className="p-6 pb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Timeline
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-t border-b border-border text-[11px] text-muted-foreground">
                      <th className="text-left font-medium py-2.5 pl-6 pr-4 w-20">Date</th>
                      <th className="text-left font-medium py-2.5 pr-4 w-36">Event</th>
                      <th className="text-left font-medium py-2.5 pr-6">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opp.timeline.map((event) => (
                      <tr key={event.id} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pl-6 pr-4 text-muted-foreground whitespace-nowrap font-mono">
                          {new Date(event.occurredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </td>
                        <td className="py-2.5 pr-4 font-medium whitespace-nowrap">
                          {eventTypeLabels[event.type]}
                        </td>
                        <td className="py-2.5 pr-6 text-muted-foreground">
                          {event.note}
                          {event.evidenceUrl && (
                            <a
                              href={event.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar — Actions */}
          <div className="w-full self-start border border-border bg-card px-3 py-3 shadow-sm sticky top-6">
            <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Actions
            </h4>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => setGenerateClaimOpen(true)}
                disabled={actionsDisabled}
              >
                <Mail className="h-4 w-4 mr-2" />
                Generate Claim
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStatus("SENT")}
                disabled={status === "SENT" || actionsDisabled}
              >
                <Send className="h-4 w-4 mr-2" />
                Mark Sent
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStatus("CREDITED")}
                disabled={actionsDisabled}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Credited
              </Button>
              <div className="border-t border-border my-1" />
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setStatus("CLOSED")}
                disabled={status === "CLOSED"}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Claim pane — wide slide-over */}
      <AnimatePresence>
        {generateClaimOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGenerateClaimOpen(false)}
            />
            <motion.div
              className="relative z-10 flex h-full w-[85vw] flex-col border-l border-border bg-background shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex-none flex items-center justify-between border-b border-border bg-card px-5 py-3">
                <h2 className="font-display text-[16px] font-medium leading-none text-foreground">
                  Generated Claim — {opp.poNumber}
                </h2>
                <button
                  type="button"
                  onClick={() => setGenerateClaimOpen(false)}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <GenerateClaimPanel
                  opp={opp}
                  supplier={supplier}
                  disabled={actionsDisabled}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
