"use client";

import type { Order } from "@/lib/types";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import CustomerPODocument, { type CustomerPOLineItem } from "./CustomerPODocument";
import { PoDocumentViewer } from "./PoDocumentViewer";
import { TimelineSection } from "./TimelineSection";

const HEXA_RECIPIENT = "Hexa Manufacturing Co. — Sales Department";
const HEXA_EMAIL = "sales@hexamfg.com";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  order: Order;
}

/**
 * Left-hand "source" panel for an order. Once a customer PO has been received it
 * renders the PO as a formatted document on top and pushes the source emails
 * below. When a mismatched PO is later corrected, the original PO collapses into
 * an expandable bar and the revised PO is shown at the top.
 */
export function OrderSourcePanel({ order }: Props) {
  const flow = order.demoFlow;
  const allAttachments = order.attachments ?? [];

  const poConf = flow?.poConfirmation;
  const hasReceivedPo = !!poConf || order.stage === "po_mismatch";

  if (!flow || !hasReceivedPo) {
    return <AttachmentViewer attachments={allAttachments} />;
  }

  // Emails / source docs only — the generated PO PDFs (att-po-*) are replaced by
  // the formatted documents rendered above.
  const emailAttachments = allAttachments.filter((a) => !a.id.startsWith("att-po-"));

  const quoteItems = flow.quoteSummary?.items ?? [];
  const quoteNumber = flow.quoteNumber ?? flow.quoteSummary?.quoteNumber ?? "the approved quote";
  const comparison = flow.quoteComparison;
  const received = flow.receivedPoLines;
  const isResolved = comparison?.overallMatch === true;
  const wasMismatch = !!received;

  const poBase = flow.poNumber ?? order.poNumber ?? "PO";
  const company = order.customer.company || order.customer.name;
  const shipTo = order.customer.shippingAddress || order.shipTo || "—";
  const paymentTerms = order.paymentTerms || "Net 30";
  const receivedDate = poConf?.receivedAt ?? order.createdAt;

  const buyerProps = {
    buyerName: company,
    buyerAddress: order.customer.billingAddress || shipTo,
    preparedBy: order.customer.name,
    buyerEmail: order.customer.email,
    buyerPhone: order.customer.phone,
    recipientName: HEXA_RECIPIENT,
    recipientEmail: HEXA_EMAIL,
    shipTo,
    paymentTerms,
  };

  const quoteLines: CustomerPOLineItem[] = quoteItems.map((qi) => ({
    name: qi.name,
    sku: qi.sku,
    quantity: qi.qty,
    unitPrice: qi.unitPrice,
    uom: "units",
  }));

  const originalLines: CustomerPOLineItem[] = (received ?? quoteItems.map((qi) => ({
    sku: qi.sku,
    name: qi.name,
    qty: qi.qty,
    unitPrice: qi.unitPrice,
    mismatch: false,
  }))).map((rl) => ({
    name: rl.name,
    sku: rl.sku,
    quantity: rl.qty,
    unitPrice: rl.unitPrice,
    uom: "units",
    highlight: rl.mismatch,
  }));

  // ── Mismatch detected, not yet corrected: show the single received PO ──────
  if (!isResolved) {
    return (
      <div className="space-y-4">
        <PoDocumentViewer fileName={`${poBase}.pdf`}>
          <CustomerPODocument
            {...buyerProps}
            poNumber={poBase}
            issuedDate={receivedDate}
            subject={`Supply against Hexa Quote ${quoteNumber}`}
            intro={`${company} is placing the following purchase order with ${HEXA_RECIPIENT}, referencing Quote ${quoteNumber}. Please supply the items below to the delivery address noted.`}
            lineItems={originalLines}
            notes={[
              `Issued against Hexa Quote ${quoteNumber}.`,
              `Deliver to ${shipTo}.`,
              `Reference ${poBase} on all packing slips, shipping labels, and invoices.`,
              `Payment terms: ${paymentTerms}.`,
            ]}
          />
        </PoDocumentViewer>
        <AttachmentViewer attachments={emailAttachments} />
      </div>
    );
  }

  // ── Resolved. If it followed a mismatch, show revised on top + original bar ─
  if (wasMismatch) {
    const revisedPoNumber = poConf?.poNumber?.endsWith("-R1")
      ? poConf.poNumber
      : `${poBase}-R1`;

    const corrections: string[] = [];
    (received ?? []).forEach((rl, idx) => {
      const q = quoteItems[idx];
      if (!q) return;
      if (rl.qty !== q.qty) {
        corrections.push(
          `${q.name}: quantity corrected from ${rl.qty.toLocaleString()} to ${q.qty.toLocaleString()} to match the quote.`
        );
      }
      if (rl.unitPrice !== q.unitPrice) {
        corrections.push(
          `${q.name}: unit price corrected from $${rl.unitPrice.toFixed(2)} to $${q.unitPrice.toFixed(2)} to match the quote.`
        );
      }
    });

    const firstDiff = (received ?? []).find((rl, idx) => {
      const q = quoteItems[idx];
      return q && (rl.qty !== q.qty || rl.unitPrice !== q.unitPrice);
    });
    const firstQuote = firstDiff
      ? quoteItems[(received ?? []).indexOf(firstDiff)]
      : undefined;
    const barSummary = firstDiff && firstQuote
      ? firstDiff.qty !== firstQuote.qty
        ? `${poBase} — qty ${firstDiff.qty.toLocaleString()} vs ${firstQuote.qty.toLocaleString()} quoted (superseded)`
        : `${poBase} — $${fmt(firstDiff.unitPrice)} vs $${fmt(firstQuote.unitPrice)} quoted (superseded)`
      : `${poBase} — superseded by ${revisedPoNumber}`;

    return (
      <div className="space-y-4">
        <PoDocumentViewer fileName={`${revisedPoNumber}.pdf`}>
          <CustomerPODocument
            {...buyerProps}
            poNumber={revisedPoNumber}
            issuedDate={receivedDate}
            subject={`Revised PO — corrected to match Hexa Quote ${quoteNumber}`}
            intro={`${company} is issuing this revised purchase order to resolve the discrepancies Hexa flagged against Quote ${quoteNumber}. Quantities and pricing now match the approved quote.`}
            lineItems={quoteLines}
            notes={[
              `Revised to align with Hexa Quote ${quoteNumber} — supersedes ${poBase}.`,
              ...(corrections.length > 0
                ? corrections
                : ["All lines corrected to match the approved quote."]),
              `Deliver to ${shipTo}.`,
              `Reference ${revisedPoNumber} on all packing slips, shipping labels, and invoices.`,
            ]}
            footerNote={`Revised PO — supersedes ${poBase}. Issued after Hexa's correction request resolved the quote mismatch.`}
          />
        </PoDocumentViewer>

        <TimelineSection
          title="Original PO — Superseded"
          isActive={false}
          summary={barSummary}
          isLast
        >
          <PoDocumentViewer fileName={`${poBase}.pdf`}>
            <CustomerPODocument
              {...buyerProps}
              poNumber={poBase}
              issuedDate={receivedDate}
              subject={`Supply against Hexa Quote ${quoteNumber}`}
              intro={`${company}'s original purchase order referencing Quote ${quoteNumber}. This version was superseded after Hexa flagged a mismatch against the approved quote.`}
              lineItems={originalLines}
              notes={[
                `Original submission — later corrected via ${revisedPoNumber}.`,
                `Highlighted line(s) did not match Hexa Quote ${quoteNumber}.`,
                `Deliver to ${shipTo}.`,
              ]}
              footerNote={`Superseded by ${revisedPoNumber}.`}
            />
          </PoDocumentViewer>
        </TimelineSection>

        <AttachmentViewer attachments={emailAttachments} />
      </div>
    );
  }

  // ── Resolved with no prior mismatch: single matched PO ─────────────────────
  const matchedPoNumber = poConf?.poNumber ?? poBase;
  return (
    <div className="space-y-4">
      <PoDocumentViewer fileName={`${matchedPoNumber}.pdf`}>
        <CustomerPODocument
          {...buyerProps}
          poNumber={matchedPoNumber}
          issuedDate={receivedDate}
          subject={`Supply against Hexa Quote ${quoteNumber}`}
          intro={`${company} is placing the following purchase order with ${HEXA_RECIPIENT}, referencing Quote ${quoteNumber}. This PO matches the approved quote.`}
          lineItems={quoteLines}
          notes={[
            `Issued against Hexa Quote ${quoteNumber} — matches the approved quote.`,
            `Deliver to ${shipTo}.`,
            `Reference ${matchedPoNumber} on all packing slips, shipping labels, and invoices.`,
            `Payment terms: ${paymentTerms}.`,
          ]}
        />
      </PoDocumentViewer>
      <AttachmentViewer attachments={emailAttachments} />
    </div>
  );
}
