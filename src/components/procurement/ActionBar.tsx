"use client";

import { useState } from "react";
import { Send, XCircle, Check, AlertCircle, ExternalLink, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcurementStatus } from "@/lib/procurement-types";

interface ActionBarProps {
  status: ProcurementStatus;
  hasSupplierSelected: boolean;
  selectedQuoteId?: string | null;
  supplierEmail?: string;
  orderMode?: "po" | "rfq";
  isAutoProgressing?: boolean;
  isDemoActive?: boolean;
  confirmationReceived?: boolean;
  onClose: () => void;
  onSendRFQ?: () => void;
  onSendPO?: () => void;
  onSendPOFromQuote?: () => void;
}

export default function ActionBar({
  status,
  hasSupplierSelected,
  selectedQuoteId = null,
  supplierEmail,
  orderMode = "po",
  isAutoProgressing = false,
  isDemoActive = false,
  confirmationReceived = false,
  onClose,
  onSendRFQ,
  onSendPO,
  onSendPOFromQuote,
}: ActionBarProps) {
  const [legacyStatus, setLegacyStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isDemoActive && legacyStatus === "sent") {
    const sentLabel = orderMode === "po" ? "PO Sent" : "RFQ Sent";
    const sentMessage = orderMode === "po"
      ? "PO has been sent to the selected supplier"
      : "RFQ has been sent to the selected suppliers";
    return (
      <div className="flex-none border-t border-emerald-500/20 bg-emerald-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white">
            <Check className="h-3.5 w-3.5" />
            {sentLabel}
          </div>
          <p className="text-[12px] text-emerald-700/70">{sentMessage}</p>
        </div>
      </div>
    );
  }

  if (!isDemoActive && legacyStatus === "error") {
    return (
      <div className="flex-none border-t border-red-500/20 bg-red-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 text-[13px] font-medium text-white">
            <AlertCircle className="h-3.5 w-3.5" />
            Action Failed
          </div>
          <p className="text-[12px] text-red-700/70 flex-1 truncate">
            {errorMsg || "Something went wrong. Please try again."}
          </p>
          <button onClick={() => setLegacyStatus("idle")} className="text-[12px] text-muted-foreground underline hover:text-foreground">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isPOMode = orderMode === "po";

  if (isDemoActive && isAutoProgressing) {
    const waitMessage =
      status === "rfq_sent"
        ? "Waiting for supplier quotes..."
        : status === "po_sent" && !confirmationReceived
          ? "Awaiting supplier confirmation..."
          : status === "po_sent" && confirmationReceived
            ? "Confirmation received — preparing shipment..."
            : status === "shipped"
              ? "Tracking updates arriving..."
              : "Processing...";

    return (
      <div className="flex-none border-t border-blue-500/20 bg-blue-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-5 py-2.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span className="text-[13px] font-medium text-blue-700 animate-pulse">
              {waitMessage}
            </span>
          </div>
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
    );
  }

  if (isDemoActive && status === "delivered") {
    return (
      <div className="flex-none border-t border-emerald-500/20 bg-emerald-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white">
            <Check className="h-3.5 w-3.5" />
            Delivery Received
          </div>
          <p className="text-[12px] text-emerald-700/70">Items received and checked in at dock</p>
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
    );
  }

  return (
    <div className="flex-none border-t border-border bg-card px-7 py-4">
      <div className="flex items-center gap-3">
        {status === "flagged" && (
          <>
            {isPOMode ? (
              <button
                onClick={() => {
                  if (isDemoActive) {
                    onSendPO?.();
                  } else {
                    setLegacyStatus("sent");
                  }
                }}
                disabled={!hasSupplierSelected}
                className={cn(
                  "inline-flex items-center gap-2 border px-5 py-2.5 text-[13px] font-medium transition-colors",
                  hasSupplierSelected
                    ? "border-transparent bg-foreground text-background hover:opacity-90"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
              >
                <Send className="h-3.5 w-3.5" />
                Send PO
              </button>
            ) : (
              <button
                onClick={() => {
                  if (isDemoActive) {
                    onSendRFQ?.();
                  } else {
                    setLegacyStatus("sending");
                    setTimeout(() => setLegacyStatus("sent"), 500);
                  }
                }}
                disabled={!hasSupplierSelected || legacyStatus === "sending"}
                className={cn(
                  "inline-flex items-center gap-2 border px-5 py-2.5 text-[13px] font-medium transition-colors",
                  hasSupplierSelected
                    ? "border-transparent bg-foreground text-background hover:opacity-90"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
              >
                {legacyStatus === "sending" ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                    Sending&hellip;
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send RFQ
                  </>
                )}
              </button>
            )}
          </>
        )}

        {status === "rfq_sent" && !isAutoProgressing && (
          <p className="text-[12px] text-muted-foreground">
            Waiting for supplier quotes. You&apos;ll be able to evaluate and select once responses arrive.
          </p>
        )}

        {status === "quotes_received" && (
          <button
            onClick={() => onSendPOFromQuote?.()}
            disabled={!selectedQuoteId}
            className={cn(
              "inline-flex items-center gap-2 border px-5 py-2.5 text-[13px] font-medium transition-colors",
              selectedQuoteId
                ? "border-transparent bg-foreground text-background hover:opacity-90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            Send PO from Selected Quote
          </button>
        )}

        {status === "po_sent" && !isAutoProgressing && supplierEmail && (
          <a
            href={`mailto:${supplierEmail}`}
            className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact Supplier
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

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
  );
}
