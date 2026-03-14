"use client";

import { useState } from "react";
import { Send, XCircle, Check, AlertCircle, ExternalLink, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcurementStatus } from "@/lib/procurement-types";

interface ActionBarProps {
  status: ProcurementStatus;
  hasSupplierSelected: boolean;
  selectedQuoteId?: string | null;
  supplierEmail?: string;
  orderMode?: "po" | "rfq";
  onClose: () => void;
  onSendRFQ?: () => Promise<void>;
  onDraftPO?: () => void;
  onSendPO?: () => void;
}

export default function ActionBar({
  status,
  hasSupplierSelected,
  selectedQuoteId = null,
  supplierEmail,
  orderMode = "po",
  onClose,
  onSendRFQ,
  onDraftPO,
}: ActionBarProps) {
  const [actionStatus, setActionStatus] = useState<"idle" | "sending" | "sent" | "error" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendRFQ = async () => {
    setActionStatus("sending");
    setErrorMsg("");
    try {
      await onSendRFQ?.();
      setActionStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send RFQ");
      setActionStatus("error");
    }
  };

  const handleDraftPO = () => {
    onDraftPO?.();
    setActionStatus("done");
  };

  const sentLabel = orderMode === "po" ? "PO Sent" : "RFQ Sent";
  const sentMessage = orderMode === "po"
    ? "PO has been sent to the selected supplier"
    : "RFQ has been sent to the selected suppliers";

  if (actionStatus === "sent") {
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

  if (actionStatus === "done") {
    return (
      <div className="flex-none border-t border-emerald-500/20 bg-emerald-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white">
            <Check className="h-3.5 w-3.5" />
            Done
          </div>
          <p className="text-[12px] text-emerald-700/70">Action completed</p>
        </div>
      </div>
    );
  }

  if (actionStatus === "error") {
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
          <button onClick={() => setActionStatus("idle")} className="text-[12px] text-muted-foreground underline hover:text-foreground">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isPOMode = orderMode === "po";

  return (
    <div className="flex-none border-t border-border bg-card px-7 py-4">
      <div className="flex items-center gap-3">
        {status === "flagged" && (
          <>
            {isPOMode ? (
              <button
                onClick={handleDraftPO}
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
                onClick={handleSendRFQ}
                disabled={!hasSupplierSelected || actionStatus === "sending"}
                className={cn(
                  "inline-flex items-center gap-2 border px-5 py-2.5 text-[13px] font-medium transition-colors",
                  hasSupplierSelected
                    ? "border-transparent bg-foreground text-background hover:opacity-90"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
              >
                {actionStatus === "sending" ? (
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

        {status === "rfq_sent" && (
          <p className="text-[12px] text-muted-foreground">
            Waiting for supplier quotes. You&apos;ll be able to evaluate and select once responses arrive.
          </p>
        )}

        {status === "quotes_received" && (
          <button
            onClick={handleDraftPO}
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

        {status === "po_sent" && supplierEmail && (
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
