"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, User, Calendar, Mail, Check, ChevronDown,
  FileText, Send, Loader2, Star, Building2,
  XCircle, Package, BarChart3, Sparkles, ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ProcurementItem, ProcurementDemoShipment } from "@/lib/procurement-types";
import ProcurementShipmentPanel from "./ProcurementShipmentPanel";

interface Props {
  item: ProcurementItem;
  onClose: () => void;
  onItemUpdate?: (item: ProcurementItem) => void;
}

/* ─── Static data ─────────────────────────────────────────────────────────── */

const NODE_IDS = [
  "email_parsed",
  "rfq_generated",
  "identifying_suppliers",
  "quotes_received",
  "supplier_selection",
  "po_sent",
  "confirmation",
  "shipment_tracking",
] as const;

type NodeId = (typeof NODE_IDS)[number];

const NODE_TITLES: Record<NodeId, string> = {
  email_parsed: "Email Parsed — Parts Identified",
  rfq_generated: "RFQ Generated",
  identifying_suppliers: "Identifying Suppliers",
  quotes_received: "Quotes Received",
  supplier_selection: "Supplier Selection",
  po_sent: "Purchase Order Sent",
  confirmation: "Supplier Confirmation",
  shipment_tracking: "Shipment Tracking",
};

const STATIC_SUMMARIES: Partial<Record<NodeId, string>> = {
  email_parsed: "3 line items parsed from Sarah Chen's email — 94% confidence",
  rfq_generated: "RFQ auto-generated — 3 line items, delivery by Mar 25",
  identifying_suppliers: "RFQ sent to 5 suppliers — 4 ERP approved, 1 recommended",
  quotes_received: "4 quotes received — $2,028 to $2,334 range",
};

const ACTION_LABELS: Record<NodeId, string | null> = {
  email_parsed: "Generate RFQ",
  rfq_generated: "Approve RFQ",
  identifying_suppliers: "Send RFQ to Suppliers",
  quotes_received: "Continue to Selection",
  supplier_selection: "DYNAMIC",
  po_sent: "Continue",
  confirmation: "DYNAMIC",
  shipment_tracking: null,
};

type ShipmentStage = ProcurementDemoShipment["status"];

const SHIPMENT_SEQUENCE: { status: ShipmentStage; delayMs: number }[] = [
  { status: "shipment_created", delayMs: 2000 },
  { status: "label_created", delayMs: 3000 },
  { status: "picked_up", delayMs: 3500 },
  { status: "in_transit", delayMs: 4000 },
  { status: "out_for_delivery", delayMs: 4500 },
  { status: "delivered", delayMs: 5000 },
];

const PARSED_PARTS = [
  { line: 1, name: "Pneumatic Cylinder 40mm Bore × 200mm Stroke", sku: "PNE-CYL-40-200", qty: 12, uom: "EA" },
  { line: 2, name: "Cylinder Mounting Bracket Kit", sku: "PNE-MNT-BRK-40", qty: 12, uom: "EA" },
  { line: 3, name: '5/3 Way Solenoid Valve ¼" NPT', sku: "SOL-VLV-53-025", qty: 6, uom: "EA" },
];

interface SupplierInfo {
  name: string;
  email: string;
  source: "erp" | "recommended";
  recommendedBy?: string;
  reliability: number;
  leadDays: number;
}

const SUPPLIERS: SupplierInfo[] = [
  { name: "Consolidated Hardware Supply", email: "orders@conhardware.com", source: "erp", reliability: 92, leadDays: 5 },
  { name: "Pacific Fastener Corp", email: "sales@pacificfastener.com", source: "erp", reliability: 88, leadDays: 7 },
  { name: "Apex Steel & Alloys", email: "orders@apexsteel.com", source: "erp", reliability: 94, leadDays: 6 },
  { name: "Nordic Bearings AB", email: "export@nordicbearings.se", source: "erp", reliability: 90, leadDays: 9 },
  { name: "TechParts International", email: "rfq@techparts.com", source: "recommended", recommendedBy: "Marcus Rivera", reliability: 95, leadDays: 4 },
];

interface QuoteInfo {
  supplier: string;
  unitPrices: number[];
  leadDays: number;
  terms: string;
  total: number;
}

const QUOTES: QuoteInfo[] = [
  { supplier: "Consolidated Hardware Supply", unitPrices: [87.50, 24.00, 145.00], leadDays: 5, terms: "Net 30", total: 2208.00 },
  { supplier: "Pacific Fastener Corp", unitPrices: [92.00, 26.50, 152.00], leadDays: 7, terms: "Net 45", total: 2334.00 },
  { supplier: "Apex Steel & Alloys", unitPrices: [84.00, 22.50, 141.00], leadDays: 6, terms: "Net 30", total: 2124.00 },
  { supplier: "TechParts International", unitPrices: [79.00, 21.00, 138.00], leadDays: 4, terms: "Net 60", total: 2028.00 },
];

const RECOMMENDED = "TechParts International";
const RECOMMENDATION_REASON =
  "Lowest total cost at $2,028 (8% below average), fastest lead time at 4 days, and highest reliability score at 95%. Marcus Rivera confirms strong track record on prior packaging line projects.";

function deliveryDateForSupplier(leadDays: number): string {
  const d = new Date("2026-03-14");
  d.setDate(d.getDate() + leadDays + 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shipDateForSupplier(leadDays: number): string {
  const d = new Date("2026-03-14");
  d.setDate(d.getDate() + leadDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Main Component ──────────────────────────────────────────────────────── */

export default function ManualRequestDemoPanel({ item, onClose, onItemUpdate }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSupplier, setSelectedSupplier] = useState(RECOMMENDED);
  const [confirmationReceived, setConfirmationReceived] = useState(false);
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStage>("draft");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const deliveredCalledRef = useRef(false);

  const activeNodeId = NODE_IDS[activeIndex];

  const chosenQuote = useMemo(
    () => QUOTES.find((q) => q.supplier === selectedSupplier)!,
    [selectedSupplier],
  );
  const chosenSupplierInfo = useMemo(
    () => SUPPLIERS.find((s) => s.name === selectedSupplier)!,
    [selectedSupplier],
  );

  const estimatedDeliveryIso = useMemo(() => {
    const d = new Date("2026-03-14");
    d.setDate(d.getDate() + chosenQuote.leadDays + 1);
    return d.toISOString().split("T")[0];
  }, [chosenQuote.leadDays]);

  const demoShipment: ProcurementDemoShipment = useMemo(() => ({
    shipmentId: `shp-demo-${item.id}`,
    status: shipmentStatus,
    carrier: "fedex",
    trackingNumber: "794644790188",
    estimatedDelivery: estimatedDeliveryIso,
    latestEventAt: new Date().toISOString(),
  }), [item.id, shipmentStatus, estimatedDeliveryIso]);

  // auto-transition only for confirmation node
  useEffect(() => {
    if (activeNodeId !== "confirmation") return;
    timerRef.current = setTimeout(() => setConfirmationReceived(true), 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeNodeId]);

  // auto-advance to shipment tracking once confirmation is received
  useEffect(() => {
    if (activeNodeId !== "confirmation" || !confirmationReceived) return;
    const timer = setTimeout(() => advance(), 2000);
    return () => clearTimeout(timer);
  }, [activeNodeId, confirmationReceived]);

  // auto-progression for shipment tracking
  useEffect(() => {
    if (activeNodeId !== "shipment_tracking") return;
    const currentIdx = SHIPMENT_SEQUENCE.findIndex((s) => s.status === shipmentStatus);
    const nextStep = shipmentStatus === "draft" ? SHIPMENT_SEQUENCE[0] : SHIPMENT_SEQUENCE[currentIdx + 1];
    if (!nextStep) return;
    const timer = setTimeout(() => setShipmentStatus(nextStep.status), nextStep.delayMs);
    return () => clearTimeout(timer);
  }, [activeNodeId, shipmentStatus]);

  // update parent when delivered
  useEffect(() => {
    if (shipmentStatus === "delivered" && !deliveredCalledRef.current && onItemUpdate) {
      deliveredCalledRef.current = true;
      onItemUpdate({ ...item, status: "delivered" });
    }
  }, [shipmentStatus, onItemUpdate, item]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const viewport = scrollRef.current?.closest('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const advance = () => setActiveIndex((prev) => Math.min(prev + 1, NODE_IDS.length - 1));

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  };

  const visibleIndices = Array.from({ length: activeIndex + 1 }, (_, i) => i).reverse();
  const isShipmentDelivered = shipmentStatus === "delivered";
  const isComplete = activeNodeId === "shipment_tracking" && isShipmentDelivered;
  const isWaitingConfirmation = activeNodeId === "confirmation" && !confirmationReceived;
  const isShipmentAutoProgressing = activeNodeId === "shipment_tracking" && !isShipmentDelivered;

  function getSummary(nodeId: NodeId): string {
    if (STATIC_SUMMARIES[nodeId]) return STATIC_SUMMARIES[nodeId];
    switch (nodeId) {
      case "supplier_selection":
        return `${selectedSupplier} selected — $${chosenQuote.total.toLocaleString()} total`;
      case "po_sent":
        return `PO sent to ${selectedSupplier} — $${chosenQuote.total.toLocaleString()}`;
      case "confirmation":
        return `PO confirmed by ${selectedSupplier}`;
      case "shipment_tracking":
        return `Delivered — shipped via FedEx`;
      default:
        return "";
    }
  }

  function getNodeTitle(nodeId: NodeId): string {
    if (nodeId === "confirmation" && confirmationReceived) {
      return `PO Confirmation Received from ${selectedSupplier}`;
    }
    if (nodeId === "shipment_tracking" && isShipmentDelivered) {
      return "Delivery Confirmed";
    }
    return NODE_TITLES[nodeId];
  }

  function getActionLabel(): string | null {
    if (activeNodeId === "supplier_selection") {
      return `Send PO to ${selectedSupplier}`;
    }
    if (activeNodeId === "confirmation") {
      return null;
    }
    if (activeNodeId === "shipment_tracking") {
      return null;
    }
    return ACTION_LABELS[activeNodeId];
  }

  function renderNodeContent(nodeId: NodeId) {
    switch (nodeId) {
      case "email_parsed": return <EmailParsedContent />;
      case "rfq_generated": return <GeneratingRfqContent />;
      case "identifying_suppliers": return <IdentifyingSuppliersContent />;
      case "quotes_received": return <QuotesReceivedContent />;
      case "supplier_selection":
        return (
          <SupplierSelectionContent
            selected={selectedSupplier}
            onSelect={setSelectedSupplier}
            isActive={activeNodeId === "supplier_selection"}
          />
        );
      case "po_sent":
        return <POSentContent supplier={chosenSupplierInfo} quote={chosenQuote} />;
      case "confirmation":
        return <ConfirmationContent received={confirmationReceived} supplier={chosenSupplierInfo} quote={chosenQuote} />;
      case "shipment_tracking":
        return (
          <ProcurementShipmentPanel
            poId={`po-demo-${item.id}`}
            deliveryAddress="Dock 4, Building C — 1200 Industrial Blvd, San Jose, CA 95112"
            demoShipment={demoShipment}
          />
        );
      default: return null;
    }
  }

  const actionLabel = getActionLabel();
  const actionIcon = activeNodeId === "identifying_suppliers" || activeNodeId === "supplier_selection"
    ? Send
    : activeNodeId === "email_parsed"
      ? FileText
      : Check;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative z-10 flex h-full w-[85vw] flex-col border-l border-border bg-background shadow-2xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex-none border-b border-border bg-card px-7 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-[22px] font-medium leading-none text-foreground">
                    {item.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] font-semibold",
                      isComplete
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-700"
                    )}
                  >
                    {isComplete ? "Complete" : "Processing"}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Requested by {item.requestedBy}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.flaggedAt).toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric", year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    {item.sku}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground/80 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-xs p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="px-7 py-5">
              <div ref={scrollRef} className="max-w-4xl">
                {activeIndex > 0 && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-flex items-center border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      Live Demo
                    </span>
                  </div>
                )}

                {visibleIndices.map((nodeIdx, renderIdx) => {
                  const nodeId = NODE_IDS[nodeIdx];
                  const isActive = nodeIdx === activeIndex;
                  const isLast = renderIdx === visibleIndices.length - 1;
                  const isExpanded = expandedNodes.has(nodeId);

                  const showAsActive = isActive && !(nodeId === "confirmation" && confirmationReceived);

                  return (
                    <div key={nodeId}>
                      {showAsActive ? (
                        <div className="border border-blue-500/30 bg-blue-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center px-4 py-3">
                            <h3 className="text-[14px] font-semibold text-foreground">
                              {getNodeTitle(nodeId)}
                            </h3>
                          </div>
                          <div className="border-t border-blue-500/15 px-4 py-4">
                            {renderNodeContent(nodeId)}
                          </div>
                        </div>
                      ) : (
                        <div className="border border-border bg-card">
                          <button
                            onClick={() => toggleExpanded(nodeId)}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-left group"
                          >
                            <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
                              <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-[13px] font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                                  {getNodeTitle(nodeId)}
                                </h3>
                              </div>
                              {!isExpanded && (
                                <p className="mt-0.5 text-[12px] text-muted-foreground truncate max-w-xl">
                                  {getSummary(nodeId)}
                                </p>
                              )}
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                          {isExpanded && (
                            <div className="border-t border-border px-4 py-3">
                              {renderNodeContent(nodeId)}
                            </div>
                          )}
                        </div>
                      )}

                      {!isLast && (
                        <div className="ml-[25px] h-5">
                          <div className="h-full border-l-[1.5px] border-dashed border-border" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* Action Bar */}
          <div className={cn(
            "flex-none border-t px-7 py-4",
            isComplete
              ? "border-emerald-500/20 bg-emerald-500/5"
              : isWaitingConfirmation || isShipmentAutoProgressing
                ? "border-blue-500/20 bg-blue-500/5"
                : "border-border bg-card"
          )}>
            <div className="flex items-center gap-3">
              {isComplete ? (
                <>
                  <div className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white">
                    <Check className="h-3.5 w-3.5" />
                    Delivery Complete
                  </div>
                  <p className="text-[12px] text-emerald-700/70">
                    Procurement workflow complete — order from {selectedSupplier} has been delivered
                  </p>
                </>
              ) : isShipmentAutoProgressing ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span className="text-[13px] font-medium text-blue-700 animate-pulse">
                    Shipment in progress — tracking updates arriving...
                  </span>
                </div>
              ) : isWaitingConfirmation ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span className="text-[13px] font-medium text-blue-700 animate-pulse">
                    Waiting for confirmation from {selectedSupplier}...
                  </span>
                </div>
              ) : actionLabel ? (
                <button
                  onClick={advance}
                  className="inline-flex items-center gap-2 border border-transparent bg-foreground px-5 py-2.5 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
                >
                  {(() => { const Icon = actionIcon; return <Icon className="h-3.5 w-3.5" />; })()}
                  {actionLabel}
                </button>
              ) : null}

              <div className="flex-1" />
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <XCircle className="h-3.5 w-3.5" />
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─── Node Content Components ─────────────────────────────────────────────── */

function EmailParsedContent() {
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <Mail className="h-4 w-4 text-foreground/70" />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">Source Email</h3>
            <p className="text-[11px] text-muted-foreground">Parsed automatically from incoming email</p>
          </div>
          <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[10px] font-semibold">
            94% Confidence
          </Badge>
        </div>
        <div className="space-y-1.5 border-b border-border px-5 py-3.5">
          <div className="flex items-baseline gap-3 text-[12px]">
            <span className="w-12 shrink-0 text-right text-muted-foreground">From</span>
            <span className="text-foreground/85">Sarah Chen &lt;s.chen@hexamfg.com&gt;</span>
          </div>
          <div className="flex items-baseline gap-3 text-[12px]">
            <span className="w-12 shrink-0 text-right text-muted-foreground">To</span>
            <span className="text-foreground/85">procurement@hexamfg.com</span>
          </div>
          <div className="flex items-baseline gap-3 text-[12px]">
            <span className="w-12 shrink-0 text-right text-muted-foreground">Subject</span>
            <span className="font-medium text-foreground/85">Parts needed — Packaging Line 2 actuator replacement</span>
          </div>
          <div className="flex items-baseline gap-3 text-[12px]">
            <span className="w-12 shrink-0 text-right text-muted-foreground">Date</span>
            <span className="text-foreground/85">Mar 12, 2026, 9:45 AM</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12px] leading-relaxed text-foreground/75">
            Hi Procurement,<br /><br />
            We need the following parts for the Packaging Line 2 actuator replacement project. The current cylinders are failing intermittently and we need replacements before the April production ramp.<br /><br />
            - 12× Pneumatic Cylinder, 40mm bore, 200mm stroke (double-acting, magnetic piston)<br />
            - 12× Mounting bracket kits for the above cylinders<br />
            - 6× 5/3 way solenoid valves, ¼&quot; NPT ports<br /><br />
            Target delivery by end of March if possible. Let me know if you need any additional specs.<br /><br />
            Thanks,<br />
            Sarah Chen<br />
            <span className="text-muted-foreground">Production Engineering</span>
          </p>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <FileText className="h-4 w-4 text-foreground/70" />
          <h3 className="text-[13px] font-semibold text-foreground">Parsed Line Items</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-10">#</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Item</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PARSED_PARTS.map((part) => (
              <tr key={part.line}>
                <td className="px-5 py-3 text-[12px] text-muted-foreground">{part.line}</td>
                <td className="px-5 py-3 text-[13px] font-medium text-foreground/85">{part.name}</td>
                <td className="px-5 py-3 text-[12px] font-mono text-foreground/70">{part.sku}</td>
                <td className="px-5 py-3 text-[13px] text-foreground/70 text-right tabular-nums">{part.qty} {part.uom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GeneratingRfqContent() {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <FileText className="h-4 w-4 text-foreground/70" />
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">RFQ Auto-Generated</h3>
          <p className="text-[11px] text-muted-foreground">Created from parsed email data</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Line Items</p>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">3 items</p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Delivery Target</p>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">Mar 25, 2026</p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Payment Terms</p>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">Net 30 (preferred)</p>
        </div>
      </div>
      <div className="px-5 py-3.5">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Item</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Qty</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Target Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PARSED_PARTS.map((part) => (
              <tr key={part.line}>
                <td className="py-2.5 text-[12px] text-foreground/85">{part.name}</td>
                <td className="py-2.5 text-[12px] text-foreground/70 text-right tabular-nums">{part.qty}</td>
                <td className="py-2.5 text-[12px] text-muted-foreground text-right">Market rate</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IdentifyingSuppliersContent() {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <Building2 className="h-4 w-4 text-foreground/70" />
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Supplier Shortlist</h3>
          <p className="text-[11px] text-muted-foreground">4 from ERP approved list, 1 team recommendation</p>
        </div>
      </div>
      <div className="divide-y divide-border">
        {SUPPLIERS.map((sup) => (
          <div key={sup.name} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border",
                sup.source === "erp"
                  ? "border-blue-500/40 bg-blue-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              )}>
                {sup.source === "erp" ? (
                  <ShieldCheck className="h-2.5 w-2.5 text-blue-600" />
                ) : (
                  <Star className="h-2.5 w-2.5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground/85">{sup.name}</p>
                <p className="text-[11px] text-muted-foreground">{sup.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold",
                  sup.source === "erp"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-700"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                )}
              >
                {sup.source === "erp" ? "ERP Approved" : `Recommended by ${sup.recommendedBy}`}
              </Badge>
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                <span className="tabular-nums">
                  <span className={cn(
                    "font-medium",
                    sup.reliability >= 90 ? "text-emerald-700" : "text-foreground/70"
                  )}>{sup.reliability}%</span> reliability
                </span>
                <span className="tabular-nums">{sup.leadDays}d avg lead</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuotesReceivedContent() {
  const lowestTotal = Math.min(...QUOTES.map((q) => q.total));
  const fastestLead = Math.min(...QUOTES.map((q) => q.leadDays));

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <BarChart3 className="h-4 w-4 text-foreground/70" />
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Quote Comparison</h3>
          <p className="text-[11px] text-muted-foreground">4 quotes received from 5 contacted suppliers</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Supplier</th>
              {PARSED_PARTS.map((p) => (
                <th key={p.line} className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">
                  Item {p.line}
                </th>
              ))}
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Lead Time</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Terms</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {QUOTES.map((q) => {
              const isBestTotal = q.total === lowestTotal;
              const isFastest = q.leadDays === fastestLead;
              return (
                <tr key={q.supplier} className={isBestTotal ? "bg-emerald-500/5" : ""}>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-medium text-foreground/85">{q.supplier}</p>
                  </td>
                  {q.unitPrices.map((price, i) => (
                    <td key={i} className="px-5 py-3 text-right">
                      <span className="text-[13px] font-medium tabular-nums text-foreground/70">${price.toFixed(2)}</span>
                    </td>
                  ))}
                  <td className="px-5 py-3 text-center">
                    <span className={cn("text-[13px] font-medium tabular-nums", isFastest && "text-emerald-700")}>
                      {q.leadDays}d
                    </span>
                    {isFastest && (
                      <Badge variant="outline" className="ml-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[9px] px-1 py-0">
                        Fastest
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn("text-[13px] font-semibold tabular-nums", isBestTotal ? "text-emerald-700" : "text-foreground/70")}>
                      ${q.total.toLocaleString()}
                    </span>
                    {isBestTotal && (
                      <Badge variant="outline" className="ml-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[9px] px-1 py-0">
                        Best
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[12px] text-foreground/70">{q.terms}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupplierSelectionContent({
  selected,
  onSelect,
  isActive,
}: {
  selected: string;
  onSelect: (name: string) => void;
  isActive: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-amber-500/40 bg-amber-500/10">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-semibold text-foreground">
              Recommendation: {RECOMMENDED}
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-foreground/70">
              {RECOMMENDATION_REASON}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <BarChart3 className="h-4 w-4 text-foreground/70" />
          <h3 className="text-[13px] font-semibold text-foreground">
            {isActive ? "Select a Supplier" : "Supplier Selected"}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {QUOTES.map((q) => {
            const isSelected = q.supplier === selected;
            const isRecommended = q.supplier === RECOMMENDED;
            const sup = SUPPLIERS.find((s) => s.name === q.supplier)!;
            return (
              <button
                key={q.supplier}
                type="button"
                onClick={isActive ? () => onSelect(q.supplier) : undefined}
                disabled={!isActive}
                className={cn(
                  "flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors",
                  isSelected && "bg-primary/5 border-l-2 border-l-primary",
                  !isSelected && isActive && "hover:bg-accent/30 cursor-pointer",
                  !isActive && "cursor-default",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-4 w-4 rounded-none border-2 flex items-center justify-center transition-colors shrink-0",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-foreground/85">{q.supplier}</p>
                      {isRecommended && (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[9px] font-semibold px-1.5 py-0">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {q.terms} · {q.leadDays}d lead time · {sup.reliability}% reliability
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "text-[14px] font-semibold tabular-nums",
                  isSelected ? "text-foreground" : "text-foreground/70"
                )}>
                  ${q.total.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function POSentContent({ supplier, quote }: { supplier: SupplierInfo; quote: QuoteInfo }) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
          <Send className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Purchase Order Sent</h3>
          <p className="text-[12px] text-muted-foreground">PO dispatched to {supplier.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Supplier</p>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">{supplier.name}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{supplier.email}</p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Ship To</p>
          <p className="mt-1 text-[13px] text-foreground/85">1500 Factory Lane, Dock 4, Milwaukee, WI 53201</p>
        </div>
      </div>
      <div className="border-b border-border px-5 py-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5">Line Items</p>
        <div className="border border-border">
          <div className="flex items-center bg-muted/30 px-4 py-2">
            <span className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Item</span>
            <span className="w-20 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Qty</span>
            <span className="w-24 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Unit Price</span>
            <span className="w-24 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Subtotal</span>
          </div>
          {PARSED_PARTS.map((part, i) => {
            const price = quote.unitPrices[i];
            return (
              <div key={part.line} className="flex items-center border-t border-border px-4 py-2.5">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-foreground/85">{part.name}</p>
                  <p className="text-[11px] text-muted-foreground">{part.sku}</p>
                </div>
                <span className="w-20 text-center text-[12px] font-medium tabular-nums text-foreground/70">{part.qty}</span>
                <span className="w-24 text-right text-[12px] font-medium tabular-nums text-foreground/70">${price.toFixed(2)}</span>
                <span className="w-24 text-right text-[12px] font-semibold tabular-nums text-foreground">${(price * part.qty).toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-border">
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Payment Terms</p>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">{quote.terms}</p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Expected Delivery</p>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">{deliveryDateForSupplier(quote.leadDays)}</p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Value</p>
          <p className="mt-1 text-[13px] font-semibold text-foreground">${quote.total.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmationContent({
  received,
  supplier,
  quote,
}: {
  received: boolean;
  supplier: SupplierInfo;
  quote: QuoteInfo;
}) {
  if (!received) {
    return (
      <div className="border border-border bg-card px-5 py-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <div>
            <p className="text-[13px] font-medium text-foreground">Waiting for confirmation from {supplier.name}...</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Typically responds within 2–4 hours</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card">
      <div className="space-y-1.5 border-b border-border px-5 py-3.5">
        <div className="flex items-baseline gap-3 text-[12px]">
          <span className="w-12 shrink-0 text-right text-muted-foreground">From</span>
          <span className="text-foreground/85">{supplier.name} &lt;{supplier.email}&gt;</span>
        </div>
        <div className="flex items-baseline gap-3 text-[12px]">
          <span className="w-12 shrink-0 text-right text-muted-foreground">Subject</span>
          <span className="font-medium text-foreground/85">RE: Purchase Order — Pneumatic Cylinder Package</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-[12px] leading-relaxed text-foreground/75">
          Dear Hexa Procurement Team,<br /><br />
          <span className="bg-emerald-500/15 text-emerald-900 font-medium px-1 py-0.5">
            We confirm receipt of your purchase order for ${quote.total.toLocaleString()}. All items are in stock and will ship within 2 business days.
          </span><br /><br />
          Expected ship date: <span className="font-medium text-foreground/85">{shipDateForSupplier(quote.leadDays)}</span><br />
          Estimated arrival: <span className="font-medium text-foreground/85">{deliveryDateForSupplier(quote.leadDays)}</span><br /><br />
          Thank you for your business.<br /><br />
          Best regards,<br />
          {supplier.name} — Order Desk
        </p>
      </div>
    </div>
  );
}
