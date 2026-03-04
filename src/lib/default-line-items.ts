import { LineItem } from "./types";

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
