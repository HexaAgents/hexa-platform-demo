import type { Order, Attachment, ComparisonField } from "./types";

export interface DemoStep {
  id: string;
  type: "user" | "auto";
  delayMs?: number;
  apply: (order: Order) => Order;
}

function now(): string {
  return new Date().toISOString();
}

function generateClarificationQuestions(order: Order): string[] {
  const omitLinePrefix = order.demoFlow?.scenario === "rfq_advisory";
  const questions: string[] = [];
  for (const item of order.lineItems) {
    if (item.matchStatus !== "confirmed") {
      for (const issue of item.issues) {
        questions.push(
          omitLinePrefix
            ? issue
            : `Line ${item.lineNumber} (${item.parsedProductName}): ${issue}`
        );
      }
    }
  }
  if (order.parseMissingFields && order.parseMissingFields.length > 0) {
    questions.push(
      `Missing order fields: ${order.parseMissingFields.join(", ")}`
    );
  }
  return questions;
}

function deriveQuoteNumber(order: Order): string {
  if (order.demoFlow?.quoteSummary?.quoteNumber) return order.demoFlow.quoteSummary.quoteNumber;
  return `Q-${order.orderNumber.replace("ORD-", "")}`;
}

function derivePoNumber(order: Order): string {
  return `PO-${order.orderNumber.replace("ORD-", "")}`;
}

function deriveErpId(order: Order): string {
  return `ERP-${order.orderNumber.replace("ORD-", "")}`;
}

function buildPoAttachment(
  order: Order,
  variant: "mismatch" | "match" | "revised",
): Attachment {
  const poNumber = variant === "revised"
    ? `${derivePoNumber(order)}-R1`
    : derivePoNumber(order);
  const suffix = variant === "mismatch" ? "-mismatch" : "";
  const fileName = `${poNumber}${suffix}.pdf`;
  const isQuickDemo = order.demoFlow?.scenario === "rfq_quick";
  const pdfUrl = variant === "mismatch"
    ? "/po-mismatch-q-2026-0047.pdf"
    : isQuickDemo
      ? "/po-summit-demo.pdf"
      : "/po-match-q-2026-0047.pdf";
  return {
    id: `att-po-${variant}-${order.id.slice(-6)}`,
    fileName,
    mimeType: "application/pdf",
    size: variant === "mismatch" ? 3_100 : 3_400,
    url: pdfUrl,
  };
}

function appendAttachment(existing: Attachment[], newAtt: Attachment): Attachment[] {
  if (existing.some((a) => a.id === newAtt.id)) return existing;
  return [...existing, newAtt];
}

const STEP_CLARIFICATION_SENT: DemoStep = {
  id: "clarification_sent",
  type: "user",
  apply: (order) => {
    const questions = generateClarificationQuestions(order);
    const customerName = order.customer.name.split(" ")[0];

    const isPhone = order.source === "phone";
    const intro = isPhone
      ? `Thank you for your call earlier. We're putting your quote together and just need to clarify the following before we finalise:`
      : `Thank you for your enquiry (ref: ${order.orderNumber}). We need to clarify a few details before we can prepare your quotation:`;

    const body = questions.length > 0
      ? `Dear ${customerName},\n\n${intro}\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nOnce confirmed, we'll have the quote across to you promptly.\n\nKind regards,\nJames Morrison\nSales Team`
      : `Dear ${customerName},\n\nThank you for your ${isPhone ? "call" : "enquiry"} (${order.orderNumber}). We're reviewing your requirements now and will be in touch shortly.\n\nKind regards,\nJames Morrison\nSales Team`;

    return {
      ...order,
      stage: "clarification_requested",
      demoFlow: {
        ...order.demoFlow!,
        stage: "rfq_received",
        clarifications: [
          {
            questions,
            emailSent: {
              to: order.customer.email,
              subject: `${order.orderNumber} — Clarification needed for ${questions.length} items`,
              body,
              sentAt: now(),
            },
          },
        ],
      },
    };
  },
};

const STEP_CLARIFICATION_REPLY: DemoStep = {
  id: "clarification_reply",
  type: "auto",
  delayMs: 5000,
  apply: (order) => {
    const clarifications = buildClarificationReply(order);
    const lineItems = resolveLineItems(order);

    const quoteNumber = deriveQuoteNumber(order);
    const quoteItems = lineItems.map((li) => ({
      sku: li.parsedSku ?? "CUSTOM",
      name: li.parsedProductName,
      qty: li.parsedQuantity,
      unitPrice: li.parsedUnitPrice ?? 0,
    }));
    const subtotal = quoteItems.reduce(
      (s, i) => s + i.qty * i.unitPrice,
      0
    );

    return {
      ...order,
      stage: "quote_sent",
      dueDate: order.dueDate || "2026-04-20",
      lineItems,
      parseMissingFields: [],
      demoFlow: {
        ...order.demoFlow!,
        stage: "quote_prepared",
        quoteNumber,
        clarifications,
        quoteSummary: {
          quoteNumber,
          items: quoteItems,
          subtotal,
          sentAt: "",
          sentTo: order.customer.email,
        },
      },
    };
  },
};

const STEP_QUOTE_SENT: DemoStep = {
  id: "quote_sent",
  type: "user",
  apply: (order) => ({
    ...order,
    stage: "quote_sent",
    demoFlow: {
      ...order.demoFlow!,
      quoteSummary: order.demoFlow!.quoteSummary
        ? { ...order.demoFlow!.quoteSummary, sentAt: now() }
        : undefined,
    },
  }),
};

const STEP_CREATE_QUOTE: DemoStep = {
  id: "create_quote",
  type: "user",
  apply: (order) => {
    const quoteNumber = deriveQuoteNumber(order);
    const quoteItems = order.lineItems.map((li) => ({
      sku: li.parsedSku ?? "CUSTOM",
      name: li.parsedProductName,
      qty: li.parsedQuantity,
      unitPrice: li.parsedUnitPrice ?? 0,
    }));
    const subtotal = quoteItems.reduce(
      (s, i) => s + i.qty * i.unitPrice,
      0
    );

    return {
      ...order,
      stage: "quote_sent",
      dueDate: order.dueDate || "2026-04-20",
      demoFlow: {
        ...order.demoFlow!,
        stage: "quote_prepared",
        quoteNumber,
        quoteSummary: {
          quoteNumber,
          items: quoteItems,
          subtotal,
          sentAt: "",
          sentTo: order.customer.email,
        },
      },
    };
  },
};

const STEP_PO_MISMATCH: DemoStep = {
  id: "po_received_mismatch",
  type: "auto",
  delayMs: 2000,
  apply: (order) => {
    const quoteNumber =
      order.demoFlow!.quoteNumber ?? deriveQuoteNumber(order);
    const poNumber = derivePoNumber(order);
    const items = order.lineItems;
    const checks: Array<{
      field: ComparisonField;
      matches: boolean;
      quoteValue: string;
      incomingValue: string;
      note?: string;
    }> = [];

    if (items.length >= 1) {
      const item = items[0];
      const label = item.parsedSku ?? item.parsedProductName;
      const newQty = item.parsedQuantity + 50;
      checks.push({
        field: "quantity",
        matches: false,
        quoteValue: `${label} = ${item.parsedQuantity}`,
        incomingValue: `${label} = ${newQty}`,
        note: `Quantity increased from ${item.parsedQuantity} to ${newQty}`,
      });
    }
    if (items.length >= 2) {
      const item = items[1];
      const label = item.parsedSku ?? item.parsedProductName;
      const quotedPrice = item.parsedUnitPrice ?? 10;
      const poPrice = +(quotedPrice * 0.89).toFixed(2);
      checks.push({
        field: "price",
        matches: false,
        quoteValue: `${label} = $${quotedPrice.toFixed(2)}`,
        incomingValue: `${label} = $${poPrice.toFixed(2)}`,
        note: "Customer expects lower unit price",
      });
    }
    checks.push(
      {
        field: "dueDate",
        matches: true,
        quoteValue: order.dueDate || "2026-04-20",
        incomingValue: order.dueDate || "2026-04-20",
      },
      {
        field: "drawingRev",
        matches: true,
        quoteValue: "All revisions matched",
        incomingValue: "All revisions matched",
      }
    );

    const mismatchLines = checks
      .filter((c) => !c.matches)
      .map(
        (c) =>
          `- ${c.field === "quantity" ? "Quantity" : "Price"}: ${c.incomingValue} on PO vs ${c.quoteValue} quoted`
      )
      .join("\n");

    const customerName = order.customer.name.split(" ")[0];
    const poAttachment = buildPoAttachment(order, "mismatch");

    // Snapshot the incoming PO lines (mirrors the deltas used to build `checks`
    // above) so the original PO can still be rendered after it's corrected.
    const receivedPoLines = items.map((it, idx) => {
      const base = {
        sku: it.parsedSku ?? "CUSTOM",
        name: it.parsedProductName,
        qty: it.parsedQuantity,
        unitPrice: it.parsedUnitPrice ?? 0,
        mismatch: false,
      };
      if (idx === 0) {
        return { ...base, qty: it.parsedQuantity + 50, mismatch: true };
      }
      if (idx === 1) {
        return {
          ...base,
          unitPrice: +(((it.parsedUnitPrice ?? 10) * 0.89).toFixed(2)),
          mismatch: true,
        };
      }
      return base;
    });

    return {
      ...order,
      stage: "po_mismatch",
      poNumber,
      paymentTerms: order.paymentTerms || "Net 30",
      shipVia: order.shipVia || "FedEx Economy",
      attachments: appendAttachment(order.attachments ?? [], poAttachment),
      demoFlow: {
        ...order.demoFlow!,
        stage: "po_received",
        poNumber,
        quoteNumber,
        receivedPoLines,
        poConfirmation: {
          poNumber,
          receivedAt: now(),
          matchesQuote: false,
        },
        quoteComparison: {
          overallMatch: false,
          checks,
        },
        correctionDraftEmail: {
          to: order.customer.email,
          subject: `${poNumber} needs correction to match Quote ${quoteNumber}`,
          body: `Hi ${customerName},\n\nThanks for sending ${poNumber}. We detected differences against Quote ${quoteNumber}:\n\n${mismatchLines}\n\nPlease send a corrected PO or confirm you'd like us to requote these lines.\n\nBest,\nHexa Sales Ops`,
        },
      },
    };
  },
};

const STEP_CORRECTION_SENT: DemoStep = {
  id: "correction_sent",
  type: "user",
  apply: (order) => order,
};

const STEP_PO_MATCH_REVISED: DemoStep = {
  id: "po_received_match",
  type: "auto",
  delayMs: 2000,
  apply: (order) => {
    const revisedPoNumber =
      (order.demoFlow?.poNumber ?? order.poNumber ?? "PO") + "-R1";
    const poAttachment = buildPoAttachment(order, "revised");
    return {
      ...order,
      stage: "po_received",
      attachments: appendAttachment(order.attachments ?? [], poAttachment),
      demoFlow: {
        ...order.demoFlow!,
        stage: "po_validated",
        poConfirmation: {
          poNumber: revisedPoNumber,
          receivedAt: now(),
          matchesQuote: true,
        },
        quoteComparison: {
          overallMatch: true,
          checks: [
            { field: "price" as ComparisonField, matches: true, quoteValue: "All lines matched quoted prices", incomingValue: "All lines matched quoted prices" },
            { field: "quantity" as ComparisonField, matches: true, quoteValue: "All line quantities unchanged", incomingValue: "All line quantities unchanged" },
            { field: "dueDate" as ComparisonField, matches: true, quoteValue: "Due dates aligned with quote", incomingValue: "Due dates aligned with quote" },
            { field: "drawingRev" as ComparisonField, matches: true, quoteValue: "All lines at approved revisions", incomingValue: "All lines at approved revisions" },
          ],
        },
        correctionDraftEmail: undefined,
      },
    };
  },
};

const STEP_PO_MATCH_CLEAN_3S: DemoStep = {
  id: "po_received_match",
  type: "auto",
  delayMs: 3000,
  apply: (order) => buildCleanPoMatch(order),
};

const STEP_PO_MATCH_CLEAN: DemoStep = {
  id: "po_received_match",
  type: "auto",
  delayMs: 2000,
  apply: (order) => buildCleanPoMatch(order),
};

function buildCleanPoMatch(order: Order): Order {
  const poNumber = derivePoNumber(order);
  const quoteNumber = order.demoFlow!.quoteNumber ?? deriveQuoteNumber(order);
  const poAttachment = buildPoAttachment(order, "match");
  return {
    ...order,
    stage: "po_received",
    poNumber,
    paymentTerms: order.paymentTerms || "Net 30",
    attachments: appendAttachment(order.attachments ?? [], poAttachment),
    demoFlow: {
      ...order.demoFlow!,
      stage: "po_validated",
      poNumber,
      quoteNumber,
      poConfirmation: {
        poNumber,
        receivedAt: now(),
        matchesQuote: true,
      },
      quoteComparison: {
        overallMatch: true,
        checks: [
          { field: "price" as ComparisonField, matches: true, quoteValue: "All lines matched quoted prices", incomingValue: "All lines matched quoted prices" },
          { field: "quantity" as ComparisonField, matches: true, quoteValue: "All quantities matched", incomingValue: "All quantities matched" },
          { field: "dueDate" as ComparisonField, matches: true, quoteValue: "Due dates aligned", incomingValue: "Due dates aligned" },
        ],
      },
    },
  };
}

const STEP_PUSHED_TO_MRP: DemoStep = {
  id: "pushed_to_mrp",
  type: "user",
  apply: (order) => {
    const pushedAt = now();
    const erpOrderId = deriveErpId(order);
    return {
      ...order,
      stage: "pushed_to_mrp",
      mrpRoutedAt: pushedAt,
      demoFlow: {
        ...order.demoFlow!,
        mrpPush: { pushedAt, erpOrderId },
        erpSync: {
          state: "acknowledged" as const,
          timeline: [
            { label: "PO parsed and validated", state: "queued" as const, at: new Date(Date.now() - 4000).toISOString() },
            { label: "Order sent to ERP system", state: "sent" as const, at: new Date(Date.now() - 2000).toISOString() },
            { label: "ERP order acknowledged", state: "acknowledged" as const, at: pushedAt },
          ],
        },
      },
    };
  },
};

const SHIPPING_STEPS: DemoStep[] = [
  {
    id: "shipping_in_production",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      stage: "shipped",
      shipmentSummary: {
        shipmentId: `shp-${order.id.slice(-8)}`,
        status: "shipment_created",
        carrier: "fedex",
        trackingNumber: "794644790188",
        estimatedDelivery: "2026-04-18",
        latestEventAt: now(),
      },
    }),
  },
  {
    id: "shipping_ready_for_collection",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "label_created", latestEventAt: now() }
        : undefined,
    }),
  },
  {
    id: "shipping_pickup",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "picked_up", latestEventAt: now() }
        : undefined,
    }),
  },
  {
    id: "shipping_in_transit",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "in_transit", latestEventAt: now() }
        : undefined,
    }),
  },
  {
    id: "shipping_out_for_delivery",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "out_for_delivery", latestEventAt: now() }
        : undefined,
    }),
  },
  {
    id: "shipping_delivered",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      stage: "delivered",
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "delivered", latestEventAt: now() }
        : undefined,
    }),
  },
];

function resolveLineItems(order: Order) {
  return order.lineItems.map((item) => {
    if (item.matchStatus === "confirmed") return item;
    const match = item.matchedCatalogItems[0];
    if (match) {
      return {
        ...item,
        parsedSku: match.catalogSku,
        parsedProductName: match.catalogName,
        parsedUnitPrice: match.catalogPrice,
        matchStatus: "confirmed" as const,
        confidence: 92,
        matchedCatalogItems: [match],
        issues: [],
      };
    }
    const fallbackPrice = item.parsedUnitPrice ?? 25.0;
    return {
      ...item,
      parsedUnitPrice: fallbackPrice,
      matchStatus: "confirmed" as const,
      confidence: 85,
      matchedCatalogItems: [
        {
          catalogSku: `CUSTOM-${item.lineNumber}`,
          catalogName: item.parsedProductName,
          catalogDescription: `Custom item — ${item.parsedProductName}`,
          catalogPrice: fallbackPrice,
          catalogUom: item.parsedUom || "unit",
        },
      ],
      issues: [],
    };
  });
}

function buildClarificationReply(order: Order) {
  const clarifications = [...(order.demoFlow!.clarifications ?? [])];
  const unresolvedItems = order.lineItems.filter(
    (i) => i.matchStatus !== "confirmed"
  );

  const parsedAnswers = unresolvedItems.map((item) => {
    if (item.matchedCatalogItems.length > 0) {
      const match = item.matchedCatalogItems[0];
      return `${item.parsedProductName} confirmed as ${match.catalogName} (${match.catalogSku})`;
    }
    return `${item.parsedProductName}: specs confirmed, ready for custom quoting`;
  });
  if (order.parseMissingFields && order.parseMissingFields.length > 0) {
    parsedAnswers.push("Due date and pricing expectations confirmed");
  }

  if (clarifications.length > 0) {
    const customerName = order.customer.name.split(" ")[0];
    clarifications[0] = {
      ...clarifications[0],
      replyReceived: {
        body: `Hi,\n\nHere are the clarifications you requested:\n\n${parsedAnswers.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nThanks,\n${customerName}`,
        receivedAt: now(),
        parsedAnswers,
      },
    };
  }

  return clarifications;
}

const STEP_QB_CLARIFICATION_REPLY: DemoStep = {
  id: "clarification_reply",
  type: "auto",
  delayMs: 5000,
  apply: (order) => {
    const clarifications = buildClarificationReply(order);
    const lineItems = resolveLineItems(order);
    return {
      ...order,
      stage: "rfq_received",
      dueDate: order.dueDate || "2026-04-20",
      lineItems,
      parseMissingFields: [],
      demoFlow: {
        ...order.demoFlow!,
        clarifications,
      },
    };
  },
};

// ── Advisory scenario (customer unsure which SKU — Hexa recommends) ──────────

const STEP_ADV_CLARIFICATION_REPLY: DemoStep = {
  id: "clarification_reply",
  type: "auto",
  delayMs: 3000,
  apply: (order) => {
    const customerName = order.customer.name.split(" ")[0];
    const parsedAnswers = [
      "Brackets: stainless steel",
      "Framework: structural steel",
      "Connection: through-bolted",
      "Fastener diameter: approx. 1/2\"",
      "Grip length needed: ~2.5–3\"",
      "Environment: washdown / food processing facility",
      "Corrosion resistance: preferred",
      "Loading: moderate structural",
    ];
    const clarifications = [...(order.demoFlow?.clarifications ?? [])];
    if (clarifications.length > 0) {
      clarifications[0] = {
        ...clarifications[0],
        replyReceived: {
          body:
            `Hi,\n\nThanks for the quick questions. I pulled one of the bolts off the existing line and measured it — answers below.\n\n` +
            `- The brackets are stainless steel, bolting onto structural steel framework.\n` +
            `- It's a through-bolted connection, not tapped.\n` +
            `- Holes take roughly a 1/2" fastener.\n` +
            `- Grip works out to about 2.5–3" with the bracket flange and framing.\n` +
            `- The whole area is a washdown zone, so corrosion resistance matters to us.\n` +
            `- Loading is moderate / structural, nothing extreme.\n\n` +
            `I've attached a photo of the existing bolt measured against a tape — it reads right around 3". ` +
            `This is the one we currently run; whatever you'd recommend to match it works for us.\n\nThanks,\n${customerName}`,
          receivedAt: now(),
          parsedAnswers,
          photoUrl: "/products/customer-reference-fastener.png",
          photoCaption:
            "Customer photo — existing fastener pulled off the line, measured against a tape (≈3\")",
        },
      };
    }

    const replyEmailAttachment: Attachment = {
      id: `att-reply-${order.id.slice(-6)}`,
      fileName: "RE-conveyor-guide-rail.eml.html",
      mimeType: "text/html",
      size: 5_400,
      url: "/email-coldchain-reply.html",
    };
    const existing = order.attachments ?? [];
    const attachments = existing.some((a) => a.id === replyEmailAttachment.id)
      ? existing
      : [replyEmailAttachment, ...existing];

    return {
      ...order,
      stage: "clarification_received",
      attachments,
      demoFlow: {
        ...order.demoFlow!,
        clarifications,
      },
    };
  },
};

const STEP_ADV_SELECT_SKU: DemoStep = {
  id: "adv_select_sku",
  type: "user",
  apply: (order) => {
    const advisory = order.demoFlow?.skuAdvisory;
    if (!advisory) return order;
    const chosen =
      advisory.candidates.find((c) => c.id === advisory.selectedCandidateId) ??
      advisory.candidates.find((c) => c.recommended) ??
      advisory.candidates[0];
    if (!chosen) return order;

    const baseItem = order.lineItems[0];
    const qty = baseItem?.parsedQuantity ?? 400;
    const quoteNumber = deriveQuoteNumber(order);

    const resolvedLineItem = {
      ...baseItem,
      parsedSku: chosen.sku,
      parsedProductName: chosen.name,
      parsedQuantity: qty,
      parsedUnitPrice: chosen.unitPrice,
      parsedUom: baseItem?.parsedUom ?? "units",
      matchStatus: "confirmed" as const,
      confidence: 96,
      matchedCatalogItems: [
        {
          catalogSku: chosen.sku,
          catalogName: chosen.name,
          catalogDescription:
            chosen.specs?.map((s) => `${s.label}: ${s.value}`).join(", ") ??
            chosen.name,
          catalogPrice: chosen.unitPrice,
          catalogUom: chosen.uom ?? "unit",
        },
      ],
      issues: [],
    };

    const items = [
      { sku: chosen.sku, name: chosen.name, qty, unitPrice: chosen.unitPrice },
    ];
    const subtotal = qty * chosen.unitPrice;

    return {
      ...order,
      stage: "quote_sent",
      dueDate: order.dueDate || "2026-06-26",
      lineItems: [resolvedLineItem],
      parseMissingFields: [],
      demoFlow: {
        ...order.demoFlow!,
        stage: "quote_prepared",
        quoteNumber,
        skuAdvisory: {
          ...advisory,
          selectedCandidateId: chosen.id,
          selectedAt: advisory.selectedAt || now(),
        },
        quoteSummary: {
          quoteNumber,
          items,
          subtotal,
          sentAt: "",
          sentTo: order.customer.email,
        },
      },
    };
  },
};

export function getDemoSteps(order: Order): DemoStep[] {
  const isPhone = order.source === "phone";

  if (order.demoFlow?.scenario === "rfq_advisory") {
    return [
      STEP_CLARIFICATION_SENT,
      STEP_ADV_CLARIFICATION_REPLY,
      STEP_ADV_SELECT_SKU,
      STEP_QUOTE_SENT,
      STEP_PO_MISMATCH,
      STEP_CORRECTION_SENT,
      STEP_PO_MATCH_REVISED,
      STEP_PUSHED_TO_MRP,
      ...SHIPPING_STEPS,
    ];
  }

  if (order.demoFlow?.scenario === "rfq_quick") {
    return [
      STEP_CREATE_QUOTE,
      STEP_QUOTE_SENT,
      STEP_PO_MATCH_CLEAN_3S,
      STEP_PUSHED_TO_MRP,
      ...SHIPPING_STEPS,
    ];
  }

  if (order.orderType === "quote_builder") {
    const isPoPhase =
      order.stage === "quote_sent" ||
      order.stage === "po_received" ||
      order.stage === "po_mismatch";
    if (isPoPhase) {
      return isPhone
        ? [STEP_PO_MATCH_CLEAN, STEP_PUSHED_TO_MRP, ...SHIPPING_STEPS]
        : [STEP_PO_MISMATCH, STEP_CORRECTION_SENT, STEP_PO_MATCH_REVISED, STEP_PUSHED_TO_MRP, ...SHIPPING_STEPS];
    }
    return [STEP_CLARIFICATION_SENT, STEP_QB_CLARIFICATION_REPLY];
  }

  if (isPhone) {
    return [
      STEP_CLARIFICATION_SENT,
      STEP_CLARIFICATION_REPLY,
      STEP_QUOTE_SENT,
      STEP_PO_MATCH_CLEAN,
      STEP_PUSHED_TO_MRP,
      ...SHIPPING_STEPS,
    ];
  }

  return [
    STEP_CLARIFICATION_SENT,
    STEP_CLARIFICATION_REPLY,
    STEP_QUOTE_SENT,
    STEP_PO_MISMATCH,
    STEP_CORRECTION_SENT,
    STEP_PO_MATCH_REVISED,
    STEP_PUSHED_TO_MRP,
    ...SHIPPING_STEPS,
  ];
}

export const DEMO_STEPS: DemoStep[] = getDemoSteps({ source: "email" } as Order);

export function isDemoEligible(order: Order): boolean {
  if (!order.demoFlow?.scenario) return false;
  if (order.orderType === "quote_builder") {
    return (
      order.stage === "rfq_received" ||
      order.stage === "quote_sent" ||
      order.stage === "po_received"
    );
  }
  return (
    order.stage === "rfq_received" ||
    order.stage === "po_received" ||
    order.stage === "quote_sent"
  );
}

export function getStartStepIndex(order: Order): number {
  const steps = getDemoSteps(order);

  if (order.orderType === "quote_builder") {
    if (order.stage === "po_received") {
      return steps.findIndex((s) => s.id === "pushed_to_mrp");
    }
    return 0;
  }

  if (order.stage === "po_received") {
    return steps.findIndex((s) => s.id === "pushed_to_mrp");
  }
  if (order.stage === "quote_sent") {
    const quoteIdx = steps.findIndex((s) => s.id === "quote_sent");
    return quoteIdx >= 0 ? quoteIdx + 1 : 0;
  }
  return 0;
}
