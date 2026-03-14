import type { Order } from "./types";

export interface DemoStep {
  id: string;
  type: "user" | "auto";
  delayMs?: number;
  apply: (order: Order) => Order;
}

function now(): string {
  return new Date().toISOString();
}

export const DEMO_STEPS: DemoStep[] = [
  // Step 0: rfq_received — initial state, no mutation needed.
  // User reviews line items, sees clarification questions, clicks "Send Clarification".
  {
    id: "clarification_sent",
    type: "user",
    apply: (order) => ({
      ...order,
      stage: "clarification_requested",
      demoFlow: {
        ...order.demoFlow!,
        stage: "rfq_received",
        clarifications: [
          {
            questions: [
              "Line 2 (Stainless Dowel Pin): No SKU provided — is this the 6mm (DP-SS-6) or 8mm (DP-SS-8) diameter?",
              "Line 3 (Titanium Shaft Collar): Source mentions both TC-25 and TC-30 — which bore size do you need?",
              "Line 4 (Custom Spacer): No matching catalog item — can you provide material, dimensions, and quantity confirmation?",
              "Missing order fields: price, dueDate — can you confirm pricing expectations and a firm due date?",
            ],
            emailSent: {
              to: order.customer.email,
              subject: `${order.orderNumber} — Clarification needed for 4 items`,
              body: `Hi ${order.customer.name.split(" ")[0]},\n\nThank you for your RFQ for CNC machining parts. We need a few clarifications before we can prepare your quote:\n\n1. Stainless Dowel Pin — is this the 6mm (DP-SS-6) or 8mm (DP-SS-8)?\n2. Titanium Shaft Collar — TC-25 (25mm) or TC-30 (30mm)?\n3. Custom Spacer — please provide material, dimensions, and drawings.\n4. Please confirm pricing expectations and a firm due date for the lot.\n\nBest regards,\nHexa Sales Team`,
              sentAt: now(),
            },
          },
        ],
      },
    }),
  },

  // Step 1: clarification reply arrives + auto-generates draft quote (auto 5s)
  {
    id: "clarification_reply",
    type: "auto",
    delayMs: 5000,
    apply: (order) => {
      const clarifications = [...(order.demoFlow!.clarifications ?? [])];
      if (clarifications.length > 0) {
        clarifications[0] = {
          ...clarifications[0],
          replyReceived: {
            body: "Hi,\n\n1. Dowel pins should be the 6mm (DP-SS-6).\n2. We need the TC-25 (25mm bore) shaft collars.\n3. Custom spacers are 6061-T6 aluminum, 25mm OD x 15mm ID x 10mm thick. I'll send a drawing shortly.\n4. Target due date is April 20, 2026. Budget is flexible but hoping to stay under $5,000 for the lot.\n\nThanks,\nTom",
            receivedAt: now(),
            parsedAnswers: [
              "Dowel Pin confirmed as DP-SS-6 (6mm diameter)",
              "Shaft Collar confirmed as TC-25 (25mm bore)",
              "Custom Spacer: 6061-T6 aluminum, 25mm OD x 15mm ID x 10mm thick",
              "Due date: April 20, 2026 — budget target under $5,000",
            ],
          },
        };
      }

      const lineItems = order.lineItems.map((item) => {
        if (item.id === "li-demo-052") {
          return {
            ...item,
            parsedSku: "DP-SS-6",
            parsedProductName: "Stainless Dowel Pin 6mm",
            parsedUnitPrice: 1.2,
            matchStatus: "confirmed" as const,
            confidence: 96,
            matchedCatalogItems: [item.matchedCatalogItems[0]],
            issues: [],
          };
        }
        if (item.id === "li-demo-053") {
          return {
            ...item,
            parsedSku: "TC-25",
            parsedProductName: "Titanium Shaft Collar 25mm",
            parsedUnitPrice: 18.5,
            matchStatus: "confirmed" as const,
            confidence: 95,
            matchedCatalogItems: [item.matchedCatalogItems[0]],
            issues: [],
          };
        }
        if (item.id === "li-demo-054") {
          return {
            ...item,
            parsedProductName: "Custom Spacer — 6061-T6 Aluminum",
            parsedUnitPrice: 3.5,
            matchStatus: "confirmed" as const,
            confidence: 88,
            matchedCatalogItems: [
              {
                catalogSku: "CUSTOM-SPC-001",
                catalogName: "Custom Spacer 6061-T6",
                catalogDescription: "6061-T6 aluminum spacer, 25mm OD x 15mm ID x 10mm thick.",
                catalogPrice: 3.5,
                catalogUom: "unit",
              },
            ],
            issues: [],
          };
        }
        return item;
      });

      const quoteItems = lineItems.map((li) => ({
        sku: li.parsedSku ?? "CUSTOM",
        name: li.parsedProductName,
        qty: li.parsedQuantity,
        unitPrice: li.parsedUnitPrice ?? 0,
      }));
      const subtotal = quoteItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);

      return {
        ...order,
        stage: "quote_sent",
        dueDate: "2026-04-20",
        lineItems,
        parseMissingFields: [],
        demoFlow: {
          ...order.demoFlow!,
          stage: "quote_prepared",
          quoteNumber: "Q-2026-0055",
          clarifications,
          quoteSummary: {
            quoteNumber: "Q-2026-0055",
            items: quoteItems,
            subtotal,
            sentAt: "",
            sentTo: order.customer.email,
          },
        },
      };
    },
  },

  // Step 2: User reviews/edits the draft quote and clicks "Send Quote"
  {
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
  },

  // Step 3: PO arrives with mismatches (auto 2s)
  {
    id: "po_received_mismatch",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      stage: "po_mismatch",
      poNumber: "PO-2026-0388",
      paymentTerms: "Net 30",
      shipVia: "FedEx Economy",
      demoFlow: {
        ...order.demoFlow!,
        stage: "po_received",
        poNumber: "PO-2026-0388",
        poConfirmation: {
          poNumber: "PO-2026-0388",
          receivedAt: now(),
          matchesQuote: false,
        },
        quoteComparison: {
          overallMatch: false,
          checks: [
            {
              field: "quantity",
              matches: false,
              quoteValue: "AL-BRK-100 = 200",
              incomingValue: "AL-BRK-100 = 250",
              note: "Quantity increased from 200 to 250",
            },
            {
              field: "price",
              matches: false,
              quoteValue: "PB-440 = $6.50",
              incomingValue: "PB-440 = $5.80",
              note: "Customer expects lower unit price",
            },
            {
              field: "dueDate",
              matches: true,
              quoteValue: "2026-04-20",
              incomingValue: "2026-04-20",
            },
            {
              field: "drawingRev",
              matches: true,
              quoteValue: "All revisions matched",
              incomingValue: "All revisions matched",
            },
          ],
        },
        correctionDraftEmail: {
          to: order.customer.email,
          subject: "PO-2026-0388 needs correction to match Quote Q-2026-0055",
          body: `Hi Tom,\n\nThanks for sending PO-2026-0388. We detected differences against Quote Q-2026-0055:\n\n- Quantity: AL-BRK-100 is 250 on PO vs 200 quoted\n- Price: PB-440 is $5.80 on PO vs $6.50 quoted\n\nPlease send a corrected PO or confirm you'd like us to requote these lines.\n\nBest,\nHexa Sales Ops`,
        },
      },
    }),
  },

  // Step 4: User sends correction email
  {
    id: "correction_sent",
    type: "user",
    apply: (order) => order,
  },

  // Step 5: Corrected PO arrives — all matches (auto 2s)
  {
    id: "po_received_match",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      stage: "po_received",
      demoFlow: {
        ...order.demoFlow!,
        stage: "po_validated",
        poConfirmation: {
          poNumber: "PO-2026-0388-R1",
          receivedAt: now(),
          matchesQuote: true,
        },
        quoteComparison: {
          overallMatch: true,
          checks: [
            { field: "price", matches: true, quoteValue: "All lines matched quoted prices", incomingValue: "All lines matched quoted prices" },
            { field: "quantity", matches: true, quoteValue: "All line quantities unchanged", incomingValue: "All line quantities unchanged" },
            { field: "dueDate", matches: true, quoteValue: "Due dates aligned with quote", incomingValue: "Due dates aligned with quote" },
            { field: "drawingRev", matches: true, quoteValue: "All lines at approved revisions", incomingValue: "All lines at approved revisions" },
          ],
        },
        correctionDraftEmail: undefined,
      },
    }),
  },

  // Step 6: User approves and pushes to MRP
  {
    id: "pushed_to_mrp",
    type: "user",
    apply: (order) => {
      const pushedAt = now();
      return {
        ...order,
        stage: "pushed_to_mrp",
        mrpRoutedAt: pushedAt,
        demoFlow: {
          ...order.demoFlow!,
          mrpPush: {
            pushedAt,
            erpOrderId: "ERP-2026-0388",
          },
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
  },

  // Step 7: In Production — order enters manufacturing (auto 2s)
  {
    id: "shipping_in_production",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      stage: "shipped",
      shipmentSummary: {
        shipmentId: "shp-demo-005",
        status: "shipment_created",
        carrier: "fedex",
        trackingNumber: "794644790188",
        estimatedDelivery: "2026-04-18",
        latestEventAt: now(),
      },
    }),
  },

  // Step 8: Ready for Shipping Collection — production complete, staged for pickup (auto 2s)
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

  // Step 9: Carrier Pickup Confirmed (auto 2s)
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

  // Step 10: In Transit (auto 2s)
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

  // Step 11: Out for Delivery (auto 2s)
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

  // Step 12: Delivered — all substeps complete (auto 2s)
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

export function isDemoEligible(order: Order): boolean {
  return (
    order.stage === "rfq_received" &&
    order.demoFlow?.scenario === "rfq_csv" &&
    order.id === "ord-demo-005"
  );
}
