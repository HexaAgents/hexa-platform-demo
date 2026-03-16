"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle2, StickyNote, Download, ShoppingCart, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CallRecord } from "@/data/callHistory";
import type { CallDetail } from "@/data/callDetails";
import type { ExtractedItem } from "@/data/extractedItems";
import type { LineItem, Order } from "@/lib/types";
import ItemCard from "./ItemCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CallDetailViewProps {
  call: CallRecord;
  detail: CallDetail;
  onBack?: () => void;
}

export default function CallDetailView({ call, detail, onBack }: CallDetailViewProps) {
  const router = useRouter();
  const initials = call.name.split(" ").map((n) => n[0]).join("");
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleBack = onBack ?? (() => router.push("/calls"));

  const handleOrderCreated = useCallback((orderId: string) => {
    setShowOrderModal(false);
    router.push(`/orders/${orderId}`);
  }, [router]);

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBack}
            variant="secondary"
            size="icon"
            className="h-8 w-8"
          >
            <ArrowLeft size={14} className="text-muted-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/30 text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-[22px] font-medium leading-none text-foreground">
                {call.name}
              </h2>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{call.company}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
            Call Ended
          </span>
          <span className="tabular-nums text-[14px] font-mono text-foreground/70">
            {call.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-2.5" style={{
        background: "rgba(79,70,229,0.08)",
        borderBottom: "1px solid rgba(79,70,229,0.24)",
      }}>
        <p className="text-[12px] text-foreground/80">
          Review extracted items below. Edit if needed, then create an order.
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span>{call.date}</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 w-[40%] flex-col overflow-hidden border-r border-border">
          <TranscriptPanel
            transcript={detail.transcript}
            notes={detail.notes}
          />
        </div>
        <div className="flex min-h-0 w-[60%] flex-col overflow-hidden">
          <ExtractedItemsPanel
            items={detail.extractedItems}
            onCreateOrder={() => setShowOrderModal(true)}
          />
        </div>
      </div>

      <AnimatePresence>
        {showOrderModal && (
          <CallOrderCreateModal
            detail={detail}
            call={call}
            onOrderCreated={handleOrderCreated}
            onClose={() => setShowOrderModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TranscriptPanel({
  transcript,
  notes,
}: {
  transcript: CallDetail["transcript"];
  notes?: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-5 py-3">
        <span className="text-[12px] font-semibold text-muted-foreground">Transcript</span>
        <Badge variant="secondary" className="text-[10px]">{transcript.length} messages</Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 px-5 py-4">
          {transcript.map((msg, idx) => {
            const isSales = msg.role === "sales";
            return (
              <motion.div
                key={idx}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.25, ease: "easeOut" }}
                className={`flex flex-col gap-1 ${isSales ? "items-end" : "items-start"}`}
              >
                <span className={`px-1 text-[11px] font-medium ${isSales ? "text-primary/80" : "text-muted-foreground"}`}>
                  {msg.speaker}
                </span>
                <div className={`max-w-[84%] border px-4 py-2.5 ${isSales ? "border-primary/30 bg-primary/10" : "border-border bg-background/60"}`}>
                  <p className="text-[13px] leading-[1.65] text-foreground/85">
                    {msg.highlights?.length ? renderHighlighted(msg.text, msg.highlights) : msg.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {notes && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote size={12} className="text-primary/60" />
              <span className="text-[11px] font-semibold text-muted-foreground">Notes</span>
            </div>
            <p className="text-[12px] leading-relaxed text-foreground/70">{notes}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function ExtractedItemsPanel({
  items,
  onCreateOrder,
}: {
  items: ExtractedItem[];
  onCreateOrder: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background/40">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Sparkles size={13} className="text-primary/80" />
          <span className="text-[12px] font-semibold text-muted-foreground">Extracted Items</span>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">AI-detected procurement items</p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-3">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} isReview={true} index={i} />
            ))}

            <div className="mt-4 space-y-2 pb-4">
              <Button
                onClick={onCreateOrder}
                className="relative h-12 w-full overflow-hidden text-[13px] font-semibold"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={14} />
                  Create Order
                </span>
              </Button>
              <Button variant="secondary" className="h-11 w-full text-[12px] font-medium text-muted-foreground">
                <Download size={13} />
                Export as CSV
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function mapExtractedToLineItems(items: ExtractedItem[]): LineItem[] {
  return items.map((item, index) => ({
    id: item.id,
    lineNumber: index + 1,
    rawText: `${item.qty} ${item.name} – ${item.specs}`,
    parsedSku: item.sku,
    parsedProductName: item.name,
    parsedQuantity: parseFloat(item.qty.replace(/[^0-9.]/g, "")),
    parsedUom: item.qty.replace(/[0-9.,]/g, "").trim(),
    parsedUnitPrice: parseFloat(item.unitPrice.replace(/[^0-9.]/g, "")),
    requestedDueDate: item.deliveryBy,
    matchStatus: "confirmed" as const,
    confidence: item.confidence,
    matchedCatalogItems: [],
    issues: [],
  }));
}

function CallOrderCreateModal({
  detail,
  call,
  onOrderCreated,
  onClose,
}: {
  detail: CallDetail;
  call: CallRecord;
  onOrderCreated: (orderId: string) => void;
  onClose: () => void;
}) {
  const [creating, setCreating] = useState(true);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function create() {
      try {
        const lineItems = mapExtractedToLineItems(detail.extractedItems);
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: detail.customer,
            lineItems,
            source: "phone",
            emailSubject: `Phone Order – ${call.name} (${call.company})`,
            attachments: [],
            dueDate: detail.extractedItems[0]?.deliveryBy ?? null,
            shipTo: detail.extractedItems[0]?.deliveryTo ?? null,
            paymentTerms: detail.extractedItems[0]?.paymentTerms ?? null,
            ingestionSourceLabel: "calls:history",
          }),
        });
        if (!res.ok) throw new Error("Failed to create order");
        const order: Order = await res.json();
        if (!cancelled) {
          setCreatedOrder(order);
          setCreating(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setCreating(false);
        }
      }
    }
    create();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[460px] border-border bg-card p-7">
        {creating ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Creating order...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-8">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={onClose} variant="secondary" className="mt-4">
              Close
            </Button>
          </div>
        ) : createdOrder ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center border border-emerald-500/30 bg-emerald-500/10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 18 }}
                >
                  <Check size={26} className="text-emerald-400" strokeWidth={2.5} />
                </motion.div>
              </div>
              <DialogTitle className="font-display text-center text-[28px] font-medium leading-none">
                Order Created
              </DialogTitle>
              <DialogDescription className="text-center text-[13px]">
                {detail.extractedItems.length} line items added as{" "}
                <span className="bg-muted px-2 py-0.5 font-mono text-[12px] text-foreground/80">
                  {createdOrder.orderNumber}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="mb-1 overflow-hidden border border-border">
              <div className="grid grid-cols-3 gap-4 border-b border-border bg-secondary px-4 py-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Item</span>
                <span className="text-[11px] font-semibold text-muted-foreground">SKU</span>
                <span className="text-right text-[11px] font-semibold text-muted-foreground">Status</span>
              </div>
              {detail.extractedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="grid grid-cols-3 gap-4 px-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid hsl(var(--border))" : undefined }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                >
                  <span className="truncate text-[12px] font-medium text-foreground/85">{item.name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{item.sku}</span>
                  <span className="flex items-center justify-end gap-1.5 text-[12px] font-medium text-emerald-600">
                    <CheckCircle2 size={12} strokeWidth={2} />
                    Added
                  </span>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => onOrderCreated(createdOrder.id)}
              className="w-full"
            >
              View Order →
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function renderHighlighted(text: string, highlights: string[]) {
  if (!highlights?.length) return text;
  const sorted = [...highlights].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sorted.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isHL = sorted.some((h) => h.toLowerCase() === part.toLowerCase());
    if (isHL) {
      return (
        <span
          key={i}
          className="px-[3px] py-[1px]"
          style={{ backgroundColor: "rgba(250,204,21,0.25)", color: "#B45309" }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
