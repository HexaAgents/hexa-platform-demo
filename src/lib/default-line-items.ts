import { LineItem } from "./types";

const DEMO_SCENARIOS: { pattern: RegExp; items: (prefix: string) => LineItem[] }[] = [
  {
    pattern: /PO-2026-0341/i,
    items: (p) => [
      {
        id: `li-${p}-1`, lineNumber: 1,
        rawText: "120x Valve Body VB-316-90 @ $42.50 due 2026-03-28 Rev C",
        parsedSku: "VA-300", parsedProductName: "Check Valve Assembly 3-inch SS",
        parsedQuantity: 120, parsedUom: "units", parsedUnitPrice: 42.50,
        matchStatus: "confirmed", confidence: 96,
        matchedCatalogItems: [{ catalogSku: "VA-300", catalogName: "Check Valve Assembly 3-inch SS", catalogDescription: "3-inch stainless steel check valve for heavy industrial applications.", catalogPrice: 42.50, catalogUom: "unit" }],
        issues: [],
      },
      {
        id: `li-${p}-2`, lineNumber: 2,
        rawText: "60x Impeller IMP-4-220 @ $78.00 due 2026-03-29 Rev B",
        parsedSku: "PI-CEN-4", parsedProductName: 'Centrifugal Pump Impeller 4"',
        parsedQuantity: 60, parsedUom: "units", parsedUnitPrice: 78.00,
        matchStatus: "confirmed", confidence: 95,
        matchedCatalogItems: [{ catalogSku: "PI-CEN-4", catalogName: 'Centrifugal Pump Impeller 4"', catalogDescription: "4-inch cast iron centrifugal pump impeller, closed type.", catalogPrice: 85.00, catalogUom: "unit" }],
        issues: [],
      },
      {
        id: `li-${p}-3`, lineNumber: 3,
        rawText: "180x Gasket Kit SK-HT-55 @ $12.40 due 2026-03-30 Rev A",
        parsedSku: "GK-STD-25", parsedProductName: "Gasket Kit Standard 25-Pack",
        parsedQuantity: 180, parsedUom: "packs", parsedUnitPrice: 12.40,
        matchStatus: "confirmed", confidence: 94,
        matchedCatalogItems: [{ catalogSku: "GK-STD-25", catalogName: "Gasket Kit Standard 25-Pack", catalogDescription: "Assorted standard gaskets for general plumbing, 25 pieces.", catalogPrice: 18.50, catalogUom: "pack" }],
        issues: [],
      },
      {
        id: `li-${p}-4`, lineNumber: 4,
        rawText: "25x CNC Bracket 7A @ $156.00 due 2026-03-28 Rev D",
        parsedSku: null, parsedProductName: "CNC Bracket Assembly 7A",
        parsedQuantity: 25, parsedUom: "units", parsedUnitPrice: 156.00,
        matchStatus: "partial", confidence: 58,
        matchedCatalogItems: [],
        issues: ["No matching SKU found in catalog", "Part number CNC-BRK-7A not in system — may be custom fabrication", "Requires manual SKU assignment or customer confirmation"],
      },
      {
        id: `li-${p}-5`, lineNumber: 5,
        rawText: "50x Flange FLG-8-150 @ $34.75 due 2026-03-29 Rev B",
        parsedSku: "SF-3-150", parsedProductName: 'SS Flange 3" 150lb',
        parsedQuantity: 50, parsedUom: "each", parsedUnitPrice: 34.75,
        matchStatus: "conflict", confidence: 45,
        matchedCatalogItems: [
          { catalogSku: "SF-3-150", catalogName: 'SS Flange 3" 150lb', catalogDescription: "3-inch stainless steel flange, 150 lb pressure class.", catalogPrice: 18.75, catalogUom: "each" },
          { catalogSku: "SF-3-300", catalogName: 'SS Flange 3" 300lb', catalogDescription: "3-inch stainless steel flange, 300 lb pressure class.", catalogPrice: 34.00, catalogUom: "each" },
        ],
        issues: ["Price on PO ($34.75) does not match catalog ($18.75 for 150lb, $34.00 for 300lb)", "Pressure class ambiguous — could be 150lb or 300lb variant", "Manual review required"],
      },
      {
        id: `li-${p}-6`, lineNumber: 6,
        rawText: "200x Shaft Collar SH-COL-12 @ $4.50 due 2026-03-28 Rev B",
        parsedSku: "BB-6205", parsedProductName: "Ball Bearing 6205-2RS",
        parsedQuantity: 200, parsedUom: "each", parsedUnitPrice: 4.50,
        matchStatus: "confirmed", confidence: 93,
        matchedCatalogItems: [{ catalogSku: "BB-6205", catalogName: "Ball Bearing 6205-2RS", catalogDescription: "Deep groove ball bearing, 25x52x15mm, double rubber sealed.", catalogPrice: 5.10, catalogUom: "each" }],
        issues: [],
      },
    ],
  },
  {
    pattern: /PO-2026-0342/i,
    items: (p) => [
      {
        id: `li-${p}-1`, lineNumber: 1,
        rawText: "120x Valve Body VB-316-90 @ $44.90 due 2026-03-28 Rev D",
        parsedSku: "VA-300", parsedProductName: "Check Valve Assembly 3-inch SS",
        parsedQuantity: 120, parsedUom: "units", parsedUnitPrice: 44.90,
        matchStatus: "conflict", confidence: 40,
        matchedCatalogItems: [{ catalogSku: "VA-300", catalogName: "Check Valve Assembly 3-inch SS", catalogDescription: "3-inch stainless steel check valve for heavy industrial applications.", catalogPrice: 210.00, catalogUom: "unit" }],
        issues: ["Price mismatch: PO $44.90 vs Quote $42.50", "Drawing revision changed: PO Rev D vs Quote Rev C", "Customer may have updated spec — confirm before processing"],
      },
      {
        id: `li-${p}-2`, lineNumber: 2,
        rawText: "90x Impeller IMP-4-220 @ $78.00 due 2026-03-29 Rev B",
        parsedSku: "PI-CEN-4", parsedProductName: 'Centrifugal Pump Impeller 4"',
        parsedQuantity: 90, parsedUom: "units", parsedUnitPrice: 78.00,
        matchStatus: "confirmed", confidence: 94,
        matchedCatalogItems: [{ catalogSku: "PI-CEN-4", catalogName: 'Centrifugal Pump Impeller 4"', catalogDescription: "4-inch cast iron centrifugal pump impeller, closed type.", catalogPrice: 85.00, catalogUom: "unit" }],
        issues: [],
      },
      {
        id: `li-${p}-3`, lineNumber: 3,
        rawText: "180x Gasket SK-HT-55 @ $12.40 due 2026-03-22 Rev A",
        parsedSku: "GK-STD-25", parsedProductName: "Gasket Kit Standard 25-Pack",
        parsedQuantity: 180, parsedUom: "packs", parsedUnitPrice: 12.40,
        matchStatus: "confirmed", confidence: 93,
        matchedCatalogItems: [{ catalogSku: "GK-STD-25", catalogName: "Gasket Kit Standard 25-Pack", catalogDescription: "Assorted standard gaskets for general plumbing, 25 pieces.", catalogPrice: 18.50, catalogUom: "pack" }],
        issues: [],
      },
      {
        id: `li-${p}-4`, lineNumber: 4,
        rawText: "75x Ball Bearing BB-6205 @ $5.10 due 2026-03-29",
        parsedSku: "BB-6205", parsedProductName: "Ball Bearing 6205-2RS",
        parsedQuantity: 75, parsedUom: "each", parsedUnitPrice: 5.10,
        matchStatus: "confirmed", confidence: 97,
        matchedCatalogItems: [{ catalogSku: "BB-6205", catalogName: "Ball Bearing 6205-2RS", catalogDescription: "Deep groove ball bearing, 25x52x15mm, double rubber sealed.", catalogPrice: 5.10, catalogUom: "each" }],
        issues: [],
      },
      {
        id: `li-${p}-5`, lineNumber: 5,
        rawText: "40x Pump Motor assembly (unknown spec)",
        parsedSku: null, parsedProductName: "Pump Motor Assembly",
        parsedQuantity: 40, parsedUom: "units", parsedUnitPrice: null,
        matchStatus: "partial", confidence: 52,
        matchedCatalogItems: [
          { catalogSku: "PM-CEN-2HP", catalogName: "Centrifugal Pump Motor 2HP", catalogDescription: "2HP electric motor for centrifugal pumps, TEFC, 3450 RPM.", catalogPrice: 450.00, catalogUom: "unit" },
          { catalogSku: "PM-CEN-5HP", catalogName: "Centrifugal Pump Motor 5HP", catalogDescription: "5HP electric motor for centrifugal pumps, TEFC, 3450 RPM.", catalogPrice: 780.00, catalogUom: "unit" },
        ],
        issues: ["No SKU or part number in source document", "HP rating not specified — multiple motor sizes available", "Unit price missing — needs customer clarification"],
      },
    ],
  },
  {
    pattern: /handwritten/i,
    items: (p) => [
      {
        id: `li-${p}-1`, lineNumber: 1,
        rawText: "30x shaft collars SC-12 (Rev B)",
        parsedSku: "BB-6204", parsedProductName: "Ball Bearing 6204-2RS",
        parsedQuantity: 30, parsedUom: "each", parsedUnitPrice: 4.25,
        matchStatus: "confirmed", confidence: 91,
        matchedCatalogItems: [{ catalogSku: "BB-6204", catalogName: "Ball Bearing 6204-2RS", catalogDescription: "Deep groove ball bearing, 20x47x14mm, double rubber sealed.", catalogPrice: 4.25, catalogUom: "each" }],
        issues: [],
      },
      {
        id: `li-${p}-2`, lineNumber: 2,
        rawText: "75x deep groove bearing BB-6205 (Rev C)",
        parsedSku: "BB-6205", parsedProductName: "Ball Bearing 6205-2RS",
        parsedQuantity: 75, parsedUom: "each", parsedUnitPrice: 5.10,
        matchStatus: "confirmed", confidence: 97,
        matchedCatalogItems: [{ catalogSku: "BB-6205", catalogName: "Ball Bearing 6205-2RS", catalogDescription: "Deep groove ball bearing, 25x52x15mm, double rubber sealed.", catalogPrice: 5.10, catalogUom: "each" }],
        issues: [],
      },
      {
        id: `li-${p}-3`, lineNumber: 3,
        rawText: "20x gasket pack GK-STD-25",
        parsedSku: "GK-STD-25", parsedProductName: "Gasket Kit Standard 25-Pack",
        parsedQuantity: 20, parsedUom: "packs", parsedUnitPrice: 18.50,
        matchStatus: "confirmed", confidence: 96,
        matchedCatalogItems: [{ catalogSku: "GK-STD-25", catalogName: "Gasket Kit Standard 25-Pack", catalogDescription: "Assorted standard gaskets for general plumbing, 25 pieces.", catalogPrice: 18.50, catalogUom: "pack" }],
        issues: [],
      },
      {
        id: `li-${p}-4`, lineNumber: 4,
        rawText: "12x valve assy - looks like 2 inch brass (hard to read)",
        parsedSku: "VA-200", parsedProductName: "Check Valve Assembly 2-inch Brass",
        parsedQuantity: 12, parsedUom: "units", parsedUnitPrice: 95.00,
        matchStatus: "conflict", confidence: 38,
        matchedCatalogItems: [
          { catalogSku: "VA-200", catalogName: "Check Valve Assembly 2-inch Brass", catalogDescription: "2-inch brass check valve for low-pressure residential systems.", catalogPrice: 95.00, catalogUom: "unit" },
          { catalogSku: "VA-250", catalogName: "Check Valve Assembly 2.5-inch SS", catalogDescription: "2.5-inch stainless steel check valve for industrial high-pressure systems.", catalogPrice: 155.00, catalogUom: "unit" },
        ],
        issues: ["Handwriting partially illegible — valve size unclear", "Could be VA-200 (2-inch brass) or VA-250 (2.5-inch SS)", "Price differs significantly between options ($95 vs $155)", "Confirm with customer before fulfilling"],
      },
      {
        id: `li-${p}-5`, lineNumber: 5,
        rawText: "8x pump impellers ??? (illegible)",
        parsedSku: null, parsedProductName: "Pump Impeller (unknown size)",
        parsedQuantity: 8, parsedUom: "units", parsedUnitPrice: null,
        matchStatus: "partial", confidence: 22,
        matchedCatalogItems: [
          { catalogSku: "PI-CEN-4", catalogName: 'Centrifugal Pump Impeller 4"', catalogDescription: "4-inch cast iron centrifugal pump impeller, closed type.", catalogPrice: 85.00, catalogUom: "unit" },
          { catalogSku: "PI-CEN-6", catalogName: 'Centrifugal Pump Impeller 6"', catalogDescription: "6-inch cast iron centrifugal pump impeller, closed type.", catalogPrice: 125.00, catalogUom: "unit" },
        ],
        issues: ["SKU illegible in handwritten note", "Pump model and impeller size not specified", "Multiple sizes available (4\", 6\", 8\") — verify with customer"],
      },
    ],
  },
  {
    pattern: /RFQ-2026-1187/i,
    items: (p) => [
      {
        id: `li-${p}-1`, lineNumber: 1,
        rawText: "CNC-BRK-7A, CNC Bracket Assembly 7A, 50, each, $156.00",
        parsedSku: "HB-M16-60", parsedProductName: "Hex Bolt M16x60mm 25-Pack",
        parsedQuantity: 50, parsedUom: "each", parsedUnitPrice: 156.00,
        matchStatus: "confirmed", confidence: 94,
        matchedCatalogItems: [{ catalogSku: "HB-M16-60", catalogName: "Hex Bolt M16x60mm 25-Pack", catalogDescription: "Grade 8.8 hex bolt, M16 thread, 60mm length. 25 per pack.", catalogPrice: 9.40, catalogUom: "pack" }],
        issues: [],
      },
      {
        id: `li-${p}-2`, lineNumber: 2,
        rawText: "SF-4-150, SS Flange 4 inch 150lb, 200, each, $28.00",
        parsedSku: "SF-4-150", parsedProductName: 'SS Flange 4" 150lb',
        parsedQuantity: 200, parsedUom: "each", parsedUnitPrice: 28.00,
        matchStatus: "confirmed", confidence: 98,
        matchedCatalogItems: [{ catalogSku: "SF-4-150", catalogName: 'SS Flange 4" 150lb', catalogDescription: "4-inch stainless steel flange, 150 lb pressure class.", catalogPrice: 28.00, catalogUom: "each" }],
        issues: [],
      },
      {
        id: `li-${p}-3`, lineNumber: 3,
        rawText: "PI-CEN-6, Pump Impeller 6 inch, 30, units, $125.00",
        parsedSku: "PI-CEN-6", parsedProductName: 'Centrifugal Pump Impeller 6"',
        parsedQuantity: 30, parsedUom: "units", parsedUnitPrice: 125.00,
        matchStatus: "confirmed", confidence: 97,
        matchedCatalogItems: [{ catalogSku: "PI-CEN-6", catalogName: 'Centrifugal Pump Impeller 6"', catalogDescription: "6-inch cast iron centrifugal pump impeller, closed type.", catalogPrice: 125.00, catalogUom: "unit" }],
        issues: [],
      },
      {
        id: `li-${p}-4`, lineNumber: 4,
        rawText: "O-ring kit assorted, 100, kits",
        parsedSku: null, parsedProductName: "O-Ring Assortment Kit",
        parsedQuantity: 100, parsedUom: "kits", parsedUnitPrice: null,
        matchStatus: "partial", confidence: 55,
        matchedCatalogItems: [
          { catalogSku: "OR-KIT-200", catalogName: "O-Ring Assortment Kit 200pc", catalogDescription: "200-piece O-ring assortment in 18 popular sizes, nitrile rubber.", catalogPrice: 14.00, catalogUom: "kit" },
          { catalogSku: "OR-KIT-400", catalogName: "O-Ring Assortment Kit 400pc", catalogDescription: "400-piece O-ring assortment in 32 sizes, nitrile rubber.", catalogPrice: 24.00, catalogUom: "kit" },
        ],
        issues: ["No SKU specified — multiple kit sizes available (200pc, 400pc)", "Unit price not provided in RFQ", "Confirm kit size with customer"],
      },
      {
        id: `li-${p}-5`, lineNumber: 5,
        rawText: "GV-3-BR, Gate Valve 3 inch Brass, 40, units, $68.00",
        parsedSku: "GV-3-BR", parsedProductName: 'Gate Valve 3" Brass',
        parsedQuantity: 40, parsedUom: "units", parsedUnitPrice: 68.00,
        matchStatus: "confirmed", confidence: 96,
        matchedCatalogItems: [{ catalogSku: "GV-3-BR", catalogName: 'Gate Valve 3" Brass', catalogDescription: "3-inch brass gate valve, 200 WOG rated.", catalogPrice: 68.00, catalogUom: "unit" }],
        issues: [],
      },
      {
        id: `li-${p}-6`, lineNumber: 6,
        rawText: "EW-12-100, Electrical Wire 12AWG 100ft, 25, rolls, $38.50",
        parsedSku: "EW-12-100", parsedProductName: "Electrical Wire 12AWG 100ft",
        parsedQuantity: 25, parsedUom: "rolls", parsedUnitPrice: 38.50,
        matchStatus: "conflict", confidence: 42,
        matchedCatalogItems: [{ catalogSku: "EW-12-100", catalogName: "Electrical Wire 12AWG 100ft", catalogDescription: "THHN stranded copper wire, 12 AWG, 100-foot roll.", catalogPrice: 35.00, catalogUom: "roll" }],
        issues: ["Price mismatch: RFQ $38.50 vs Catalog $35.00", "Possible copper surcharge applied by customer — verify before quoting"],
      },
    ],
  },
];

export function getDemoLineItemsForSubject(subject: string, orderId: string): LineItem[] | null {
  const prefix = orderId.slice(-4);
  for (const scenario of DEMO_SCENARIOS) {
    if (scenario.pattern.test(subject)) return scenario.items(prefix);
  }
  return null;
}

export function generateDefaultLineItems(orderId: string): LineItem[] {
  const prefix = orderId.slice(-4);
  return [
    {
      id: `li-${prefix}-1`,
      lineNumber: 1,
      rawText: "24x Industrial Bearing Kit IBK-400",
      parsedSku: "IBK-400",
      parsedProductName: "Industrial Bearing Kit 400-Series",
      parsedQuantity: 24,
      parsedUom: "kits",
      parsedUnitPrice: 89.5,
      matchStatus: "confirmed",
      confidence: 96,
      matchedCatalogItems: [
        {
          catalogSku: "IBK-400",
          catalogName: "Industrial Bearing Kit 400-Series",
          catalogDescription:
            "Precision bearing set for heavy-duty machinery. Includes 8 bearings per kit.",
          catalogPrice: 89.5,
          catalogUom: "kit",
        },
      ],
      issues: [],
    },
    {
      id: `li-${prefix}-2`,
      lineNumber: 2,
      rawText: "60 stainless flanges 3 inch",
      parsedSku: null,
      parsedProductName: 'Stainless Steel Flange 3"',
      parsedQuantity: 60,
      parsedUom: "each",
      parsedUnitPrice: null,
      matchStatus: "partial",
      confidence: 68,
      matchedCatalogItems: [
        {
          catalogSku: "SF-3-150",
          catalogName: 'SS Flange 3" 150lb',
          catalogDescription:
            '3-inch stainless steel flange, 150 lb pressure class.',
          catalogPrice: 18.75,
          catalogUom: "each",
        },
        {
          catalogSku: "SF-3-300",
          catalogName: 'SS Flange 3" 300lb',
          catalogDescription:
            '3-inch stainless steel flange, 300 lb pressure class.',
          catalogPrice: 34.0,
          catalogUom: "each",
        },
      ],
      issues: [
        "No SKU provided in source document",
        "Pressure class not specified — multiple variants exist (150lb, 300lb)",
        "Unit price not specified",
      ],
    },
    {
      id: `li-${prefix}-3`,
      lineNumber: 3,
      rawText: "100 Hex Bolts M12x50 HB-M12",
      parsedSku: "HB-M12",
      parsedProductName: "Hex Bolt M12x50mm",
      parsedQuantity: 100,
      parsedUom: "packs",
      parsedUnitPrice: 6.2,
      matchStatus: "confirmed",
      confidence: 94,
      matchedCatalogItems: [
        {
          catalogSku: "HB-M12-50",
          catalogName: "Hex Bolt M12x50mm 25-Pack",
          catalogDescription:
            "Grade 8.8 hex bolt, M12 thread, 50mm length. 25 per pack.",
          catalogPrice: 6.2,
          catalogUom: "pack",
        },
      ],
      issues: [],
    },
    {
      id: `li-${prefix}-4`,
      lineNumber: 4,
      rawText: "15 valve assemblies - check type VA-200 or VA-250",
      parsedSku: "VA-200",
      parsedProductName: "Check Valve Assembly",
      parsedQuantity: 15,
      parsedUom: "units",
      parsedUnitPrice: 125.0,
      matchStatus: "conflict",
      confidence: 42,
      matchedCatalogItems: [
        {
          catalogSku: "VA-200",
          catalogName: "Check Valve Assembly 2-inch Brass",
          catalogDescription:
            "2-inch brass check valve for low-pressure residential systems.",
          catalogPrice: 95.0,
          catalogUom: "unit",
        },
        {
          catalogSku: "VA-250",
          catalogName: "Check Valve Assembly 2.5-inch SS",
          catalogDescription:
            "2.5-inch stainless steel check valve for industrial high-pressure systems.",
          catalogPrice: 155.0,
          catalogUom: "unit",
        },
      ],
      issues: [
        'Source mentions both "VA-200" and "VA-250" — ambiguous intent',
        "Price discrepancy between the two options ($95 vs $155)",
        "Manual review required to resolve conflict",
      ],
    },
    {
      id: `li-${prefix}-5`,
      lineNumber: 5,
      rawText: "8 pump impellers ???",
      parsedSku: null,
      parsedProductName: "Pump Impeller",
      parsedQuantity: 8,
      parsedUom: "units",
      parsedUnitPrice: null,
      matchStatus: "unmatched",
      confidence: 0,
      matchedCatalogItems: [],
      issues: [
        "No matching item found in product catalog",
        "SKU is illegible or missing",
        "Pump model / size not specified — unable to determine correct impeller",
        "Verify item details with customer",
      ],
    },
  ];
}
