"use client";

import { useMemo, useState, useCallback } from "react";
import { Order, ComparisonField } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Send, ArrowRight } from "lucide-react";
import type { DemoContext } from "../OrderWorkspace";

const FIELD_LABEL: Record<ComparisonField, string> = {
  price: "Price",
  quantity: "Quantity",
  dueDate: "Due Date",
  drawingRev: "Drawing Rev",
};

interface Props {
  order: Order;
  demoCtx?: DemoContext;
}

export function PoQuoteComparisonPanel({ order, demoCtx }: Props) {
  const flow = order.demoFlow;
  const [sent, setSent] = useState(false);

  const initialDraft = useMemo(
    () =>
      flow?.correctionDraftEmail ?? {
        to: order.customer.email,
        subject: `PO ${flow?.poNumber ?? order.poNumber ?? ""} requires correction`,
        body: "Please update your PO to match the approved quote.",
      },
    [flow, order.customer.email, order.poNumber]
  );

  const [toEmail, setToEmail] = useState(initialDraft.to);
  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);

  const handleSendCorrection = useCallback(() => {
    setSent(true);
    if (demoCtx && demoCtx.stepId === "correction_sent") {
      demoCtx.advance();
    }
  }, [demoCtx]);

  const handleApproveAndPush = useCallback(() => {
    if (demoCtx && demoCtx.stepId === "pushed_to_mrp") {
      demoCtx.advance();
    }
  }, [demoCtx]);

  if (!flow) return null;

  if (flow.scenario === "rfq_csv" || flow.scenario === "rfq_handwritten") {
    const comparison = flow.quoteComparison;
    const hasMismatch = comparison ? !comparison.overallMatch : false;

    if (!comparison) {
      return (
        <div className="border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[13px] font-semibold text-blue-800">
                RFQ to Quote Path
              </h3>
              <p className="mt-1 text-[12px] text-blue-800/80">
                RFQ parsed from email attachment and prepared as quote{" "}
                <span className="font-mono">{flow.quoteNumber ?? "Q-draft"}</span>.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-blue-500/30 bg-blue-500/10 text-blue-700"
            >
              Quote Ready
            </Badge>
          </div>
        </div>
      );
    }

    if (!hasMismatch) {
      return (
        <div className="space-y-4">
          <div className="border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700">
              <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
                <Check className="h-2 w-2 text-emerald-600" strokeWidth={3} />
              </div>
              Matches quote{" "}
              <span className="font-mono">{flow.quoteNumber ?? "Quote ref"}</span>
            </p>
          </div>
          {demoCtx && demoCtx.stepId === "pushed_to_mrp" && (
            <button
              type="button"
              onClick={handleApproveAndPush}
              className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] font-medium text-background hover:opacity-90"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Approve &amp; Push to MRP
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 border border-red-500/30 bg-red-500/5 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-red-800">
              PO needs clarification
            </h3>
            <p className="mt-1 text-[12px] text-red-800/80">
              <span className="font-mono">{flow.poNumber ?? order.poNumber}</span>{" "}
              does not match{" "}
              <span className="font-mono">{flow.quoteNumber ?? "Quote ref"}</span>.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-red-500/30 bg-red-500/10 text-red-700"
          >
            Mismatch Detected
          </Badge>
        </div>

        {comparison && (
          <div className="space-y-2">
            {comparison.checks.map((check) => (
              <div
                key={check.field}
                className="grid grid-cols-1 gap-2 border border-red-200 bg-background px-3 py-2.5 md:grid-cols-3"
              >
                <div className="flex items-center gap-2">
                  {check.matches ? (
                    <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
                      <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                    </div>
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-[12px] font-medium text-foreground/85">
                    {FIELD_LABEL[check.field]}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Quote: {check.quoteValue}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Incoming PO: {check.incomingValue}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h4 className="text-[12px] font-semibold uppercase tracking-wide text-red-700">
              Draft customer correction email
            </h4>
          </div>
          <div className="space-y-2">
            <input
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
              placeholder="To"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
              placeholder="Subject"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
            />
            <button
              type="button"
              onClick={handleSendCorrection}
              disabled={sent}
              className="inline-flex items-center gap-2 bg-foreground px-3 py-2 text-[12px] font-medium text-background hover:opacity-90 disabled:opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              {sent ? "Correction sent — waiting for updated PO" : "Send Correction Email"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const comparison = flow.quoteComparison;
  const hasMismatch = comparison ? !comparison.overallMatch : false;

  if (!hasMismatch) {
    return (
      <div className="space-y-4">
        <div className="border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700">
            <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
              <Check className="h-2 w-2 text-emerald-600" strokeWidth={3} />
            </div>
            Matches quote{" "}
            <span className="font-mono">{flow.quoteNumber ?? "Quote ref"}</span>
          </p>
        </div>
        {demoCtx && demoCtx.stepId === "pushed_to_mrp" && (
          <button
            type="button"
            onClick={handleApproveAndPush}
            className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] font-medium text-background hover:opacity-90"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Approve &amp; Push to MRP
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 border border-red-500/30 bg-red-500/5 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-red-800">
            PO needs clarification
          </h3>
          <p className="mt-1 text-[12px] text-red-800/80">
            <span className="font-mono">{flow.poNumber ?? order.poNumber}</span>{" "}
            does not match{" "}
            <span className="font-mono">{flow.quoteNumber ?? "Quote ref"}</span>.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-700"
        >
          Mismatch Detected
        </Badge>
      </div>

      {comparison && (
        <div className="space-y-2">
          {comparison.checks.map((check) => (
            <div
              key={check.field}
              className="grid grid-cols-1 gap-2 border border-red-200 bg-background px-3 py-2.5 md:grid-cols-3"
            >
              <div className="flex items-center gap-2">
                {check.matches ? (
                  <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
                    <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                  </div>
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-[12px] font-medium text-foreground/85">
                  {FIELD_LABEL[check.field]}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Quote: {check.quoteValue}
              </p>
              <p className="text-[12px] text-muted-foreground">
                Incoming PO: {check.incomingValue}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 border border-red-500/30 bg-red-500/5 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <h4 className="text-[12px] font-semibold uppercase tracking-wide text-red-700">
            Draft customer correction email
          </h4>
        </div>
        <div className="space-y-2">
          <input
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
            placeholder="To"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
            placeholder="Subject"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
          />
          <button
            type="button"
            onClick={handleSendCorrection}
            disabled={sent}
            className="inline-flex items-center gap-2 bg-foreground px-3 py-2 text-[12px] font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {sent ? "Correction sent — waiting for updated PO" : "Send Correction Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
