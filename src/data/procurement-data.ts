import type {
  ProcurementItem,
  Supplier,
  SupplierItemHistory,
  CoOrderPattern,
  EngineeringRequest,
  DraftRFQ,
  StockHistoryPoint,
  ERPScanConfig,
  OpenPO,
  SupplierQuote,
  PurchaseOrder,
  RFQSupplierEntry,
} from "@/lib/procurement-types";

function generateStockHistory(currentStock: number, avgDaily: number, days: number): StockHistoryPoint[] {
  const points: StockHistoryPoint[] = [];
  const now = new Date("2026-03-09");
  let level = currentStock;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    points.push({ date: date.toISOString().split("T")[0], level: Math.max(0, Math.round(level)) });

    if (i > 0) {
      const randomRestock = Math.random() > 0.92;
      if (randomRestock && level < currentStock * 0.4) {
        level += currentStock * (0.6 + Math.random() * 0.4);
      }
      level -= avgDaily * (0.7 + Math.random() * 0.6);
      level = Math.max(0, level);
    }
  }

  points[points.length - 1].level = currentStock;
  return points;
}

// --- Suppliers ---

export const suppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "Apex Steel & Alloys",
    contactEmail: "orders@apexsteel.com",
    contactPhone: "(312) 555-0142",
    paymentTerms: "Net 30",
    address: "4500 Industrial Blvd, Chicago, IL 60632",
    notes: "Preferred vendor for all steel and stainless products. Reliable, rarely late.",
  },
  {
    id: "sup-002",
    name: "Pacific Fastener Corp",
    contactEmail: "sales@pacificfastener.com",
    contactPhone: "(562) 555-0298",
    paymentTerms: "Net 45",
    address: "1200 Harbor Way, Long Beach, CA 90802",
    notes: "Good pricing on bulk fastener orders. MOQ can be high.",
  },
  {
    id: "sup-003",
    name: "MidWest Polymers Inc",
    contactEmail: "procurement@mwpolymers.com",
    contactPhone: "(614) 555-0376",
    paymentTerms: "Net 30",
    address: "890 Chemical Dr, Columbus, OH 43215",
    notes: "Sole source for specialty polymer seals. Lead times have been increasing.",
  },
  {
    id: "sup-004",
    name: "TechParts International",
    contactEmail: "rfq@techparts.com",
    contactPhone: "(408) 555-0511",
    paymentTerms: "Net 60",
    address: "2800 Innovation Way, San Jose, CA 95134",
    notes: "Custom machined parts. CNC capability up to 5-axis. Good for prototype runs.",
  },
  {
    id: "sup-005",
    name: "Consolidated Hardware Supply",
    contactEmail: "orders@conhardware.com",
    contactPhone: "(713) 555-0187",
    paymentTerms: "Net 30",
    address: "6700 Commerce Park, Houston, TX 77040",
    notes: "General-purpose supplier. Wide catalog, competitive on standard items.",
  },
  {
    id: "sup-006",
    name: "Nordic Bearings AB",
    contactEmail: "export@nordicbearings.se",
    contactPhone: "+46-8-555-0234",
    paymentTerms: "Net 60",
    address: "Industrivägen 45, 112 51 Stockholm, Sweden",
    notes: "European source for precision bearings. Longer lead times but superior quality.",
  },
  {
    id: "sup-007",
    name: "Southern Copper Works",
    contactEmail: "sales@southerncopper.com",
    contactPhone: "(205) 555-0443",
    paymentTerms: "Net 30",
    address: "3300 Foundry Rd, Birmingham, AL 35203",
    notes: "Specialist copper and brass fittings. Competitive pricing on tube stock.",
  },
  {
    id: "sup-008",
    name: "Precision Abrasives Co",
    contactEmail: "info@precisionabrasives.com",
    contactPhone: "(216) 555-0672",
    paymentTerms: "Net 45",
    address: "780 Grit Lane, Cleveland, OH 44113",
    notes: "Full range of abrasive products. Good volume discounts.",
  },
];

// --- Procurement Items ---

export const procurementItems: ProcurementItem[] = [
  {
    id: "pi-001",
    sku: "STL-FLT-304-4x8",
    name: '304 Stainless Steel Flat Sheet 4\'x8\'',
    description: "Grade 304 stainless steel flat sheet, 16-gauge, 4 foot by 8 foot. Used in housing fabrication and panel assembly.",
    source: "erp_alert",
    status: "flagged",
    priority: "critical",
    currentStock: 12,
    reorderPoint: 25,
    maxStock: 200,
    avgDailyConsumption: 3.2,
    avgDailyConsumption30d: 4.1,
    avgDailyConsumption90d: 3.2,
    flaggedAt: "2026-03-08T14:22:00Z",
    requestedBy: "System (ERP Scan)",
    category: "raw_material",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(12, 3.2, 90),
  },  // flagged — single preferred supplier
  {
    id: "pi-002",
    sku: "BRG-6205-2RS",
    name: "6205-2RS Sealed Ball Bearing",
    description: "Deep groove ball bearing, 25mm bore, 52mm OD, 15mm width. Double rubber sealed. For conveyor rollers and motor assemblies.",
    source: "erp_alert",
    status: "flagged",
    priority: "high",
    currentStock: 45,
    reorderPoint: 40,
    maxStock: 500,
    avgDailyConsumption: 4.8,
    avgDailyConsumption30d: 5.2,
    avgDailyConsumption90d: 4.8,
    flaggedAt: "2026-03-07T09:15:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-006",
    stockHistory: generateStockHistory(45, 4.8, 90),
  },
  {
    id: "pi-003",
    sku: "SEAL-VTN-75A",
    name: "Viton O-Ring Seal 75A Durometer",
    description: "Fluoroelastomer (Viton) O-ring, 75A Shore durometer, 2-inch ID x 2.25-inch OD. Chemical resistant, rated to 400°F.",
    source: "erp_alert",
    status: "flagged",
    priority: "medium",
    currentStock: 320,
    reorderPoint: 200,
    maxStock: 2000,
    avgDailyConsumption: 18,
    avgDailyConsumption30d: 22,
    avgDailyConsumption90d: 18,
    flaggedAt: "2026-03-10T11:30:00Z",
    requestedBy: "System (ERP Scan)",
    category: "consumable",
    attachments: [],
    preferredSupplierId: "sup-003",
    stockHistory: generateStockHistory(320, 18, 90),
  },  // flagged — multiple suppliers, needs choice
  {
    id: "pi-004",
    sku: "FST-HX-M10x30-GR8",
    name: "M10x30mm Hex Bolt Grade 8.8",
    description: "Metric hex head bolt, M10 thread, 30mm length, Grade 8.8 zinc plated. General assembly fastener.",
    source: "erp_alert",
    status: "quotes_received",
    priority: "high",
    currentStock: 850,
    reorderPoint: 1000,
    maxStock: 10000,
    avgDailyConsumption: 95,
    avgDailyConsumption30d: 110,
    avgDailyConsumption90d: 95,
    flaggedAt: "2026-03-06T16:45:00Z",
    requestedBy: "System (ERP Scan)",
    category: "consumable",
    attachments: [],
    preferredSupplierId: "sup-002",
    stockHistory: generateStockHistory(850, 95, 90),
    activeRfqId: "rfq-004",
  },  // quotes_received — supplier quotes in, needs evaluation
  {
    id: "pi-005",
    sku: "CU-TUBE-12-TYPE-L",
    name: '1/2" Type L Copper Tube (20ft)',
    description: "1/2-inch nominal Type L copper tube, 20-foot straight lengths. For hydraulic lines and heat exchanger assemblies.",
    source: "erp_alert",
    status: "rfq_sent",
    priority: "low",
    currentStock: 75,
    reorderPoint: 30,
    maxStock: 200,
    avgDailyConsumption: 1.8,
    avgDailyConsumption30d: 1.5,
    avgDailyConsumption90d: 1.8,
    flaggedAt: "2026-03-01T08:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "raw_material",
    attachments: [],
    preferredSupplierId: "sup-007",
    stockHistory: generateStockHistory(75, 1.8, 90),
  },
  {
    id: "pi-006",
    sku: "ABRS-FLP-80G-4.5",
    name: '4.5" Flap Disc 80-Grit Zirconia',
    description: "4.5-inch zirconia alumina flap disc, 80-grit, Type 29 conical. 7/8-inch arbor. For weld blending and surface prep.",
    source: "erp_alert",
    status: "delivered",
    priority: "medium",
    currentStock: 180,
    reorderPoint: 100,
    maxStock: 1000,
    avgDailyConsumption: 12,
    avgDailyConsumption30d: 11,
    avgDailyConsumption90d: 12,
    flaggedAt: "2026-02-25T10:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "consumable",
    attachments: [],
    preferredSupplierId: "sup-008",
    stockHistory: generateStockHistory(180, 12, 90),
    activeRfqId: "rfq-006",
    selectedQuoteId: "sq-006-a",
    purchaseOrderId: "pur-006",
  },
  {
    id: "pi-007",
    sku: "ENG-REQ-2026-001",
    name: "Custom Mounting Bracket Assembly",
    description: "Custom-designed mounting bracket for the new Series 7 conveyor module. Requires CNC machining from 6061-T6 aluminum.",
    source: "engineering_request",
    status: "po_sent",
    priority: "high",
    currentStock: 0,
    reorderPoint: 0,
    maxStock: 50,
    avgDailyConsumption: 0,
    avgDailyConsumption30d: 0,
    avgDailyConsumption90d: 0,
    flaggedAt: "2026-03-02T10:30:00Z",
    requestedBy: "Tom Nakamura",
    category: "custom_part",
    technicalSpecs: {
      material: "6061-T6 Aluminum",
      dimensions: "240mm x 85mm x 45mm",
      tolerances: "±0.05mm on mounting holes",
      finish: "Clear anodize, Type II",
      compliance: "ISO 2768-mK",
    },
    attachments: [
      { id: "att-e1", fileName: "bracket-assembly-rev3.pdf", fileType: "pdf", fileSize: 2_450_000, url: "#" },
      { id: "att-e2", fileName: "bracket-mounting-detail.dwg", fileType: "dwg", fileSize: 890_000, url: "#" },
      { id: "att-e3", fileName: "series7-interface-spec.pdf", fileType: "pdf", fileSize: 1_200_000, url: "#" },
    ],
    preferredSupplierId: "sup-004",
    stockHistory: [],
    purchaseOrderId: "pur-001",
  },  // po_sent — awaiting supplier shipment
  {
    id: "pi-008",
    sku: "ENG-REQ-2026-002",
    name: "Hardened Steel Drive Shaft",
    description: "Custom drive shaft for upgraded press assembly. Through-hardened 4140 steel, precision ground journals.",
    source: "engineering_request",
    status: "shipped",
    priority: "critical",
    currentStock: 0,
    reorderPoint: 0,
    maxStock: 10,
    avgDailyConsumption: 0,
    avgDailyConsumption30d: 0,
    avgDailyConsumption90d: 0,
    flaggedAt: "2026-02-20T15:20:00Z",
    requestedBy: "Rachel Kim",
    category: "custom_part",
    technicalSpecs: {
      material: "AISI 4140 Steel, through-hardened to 28-32 HRC",
      dimensions: "Ø45mm x 680mm overall length",
      tolerances: "±0.01mm on journal diameters, ±0.02mm on keyway",
      grade: "ASTM A193 Grade B7",
      finish: "Ground to Ra 0.8μm on bearing journals",
      compliance: "AGMA 2000-A88 Class 10",
    },
    attachments: [
      { id: "att-e4", fileName: "drive-shaft-drawing-v2.pdf", fileType: "pdf", fileSize: 3_100_000, url: "#" },
      { id: "att-e5", fileName: "shaft-3d-model.step", fileType: "step", fileSize: 5_400_000, url: "#" },
    ],
    preferredSupplierId: "sup-004",
    stockHistory: [],
    purchaseOrderId: "pur-002",
  },  // shipped — in transit, tracking active
  {
    id: "pi-009",
    sku: "ALM-6061-BAR-1.5",
    name: '6061-T6 Aluminum Round Bar 1.5" Dia',
    description: "6061-T6 aluminum alloy round bar, 1.5-inch diameter, 12-foot random lengths. For CNC turned parts and spacers.",
    source: "erp_alert",
    status: "flagged",
    priority: "medium",
    currentStock: 28,
    reorderPoint: 20,
    maxStock: 120,
    avgDailyConsumption: 1.4,
    avgDailyConsumption30d: 1.8,
    avgDailyConsumption90d: 1.4,
    flaggedAt: "2026-03-08T07:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "raw_material",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(28, 1.4, 90),
  },
  {
    id: "pi-010",
    sku: "ENG-REQ-2026-003",
    name: "Wear-Resistant Liner Plate",
    description: "AR400 abrasion-resistant steel liner plate for chute lining replacement. Plasma-cut to template.",
    source: "engineering_request",
    status: "flagged",
    priority: "medium",
    currentStock: 0,
    reorderPoint: 0,
    maxStock: 20,
    avgDailyConsumption: 0,
    avgDailyConsumption30d: 0,
    avgDailyConsumption90d: 0,
    flaggedAt: "2026-03-09T08:15:00Z",
    requestedBy: "Derek Patel",
    category: "raw_material",
    technicalSpecs: {
      material: "AR400 Abrasion-Resistant Steel",
      dimensions: "1200mm x 600mm x 12mm thick",
      tolerances: "±2mm on cut profile",
      finish: "Mill finish, deburr all edges",
    },
    attachments: [
      { id: "att-e6", fileName: "liner-plate-template.dxf", fileType: "dxf", fileSize: 340_000, url: "#" },
    ],
    preferredSupplierId: "sup-001",
    stockHistory: [],
  },
  {
    id: "pi-011",
    sku: "GREASE-EP2-14OZ",
    name: "EP2 Lithium Complex Grease Cartridge",
    description: "NLGI Grade 2 extreme pressure lithium complex grease, 14oz cartridge. For all bearing and chassis lubrication.",
    source: "erp_alert",
    status: "po_sent",
    priority: "low",
    currentStock: 48,
    reorderPoint: 24,
    maxStock: 200,
    avgDailyConsumption: 2.1,
    avgDailyConsumption30d: 2.0,
    avgDailyConsumption90d: 2.1,
    flaggedAt: "2026-03-07T13:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "consumable",
    attachments: [],
    preferredSupplierId: "sup-005",
    stockHistory: generateStockHistory(48, 2.1, 90),
    purchaseOrderId: "pur-011",
  },
  {
    id: "pi-012",
    sku: "WLD-ER70S6-035",
    name: 'ER70S-6 MIG Wire 0.035" (44lb spool)',
    description: "ER70S-6 mild steel MIG welding wire, 0.035-inch diameter, 44-pound spool. Copper-coated for smooth feeding.",
    source: "erp_alert",
    status: "flagged",
    priority: "critical",
    currentStock: 3,
    reorderPoint: 10,
    maxStock: 60,
    avgDailyConsumption: 1.2,
    avgDailyConsumption30d: 1.8,
    avgDailyConsumption90d: 1.2,
    flaggedAt: "2026-03-09T06:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "consumable",
    attachments: [],
    preferredSupplierId: "sup-005",
    stockHistory: generateStockHistory(3, 1.2, 90),
  },
  {
    id: "pi-013",
    sku: "CTG-MTR-12AWG-500",
    name: "12 AWG Control Cable (500ft spool)",
    description: "Multi-conductor 12 AWG control cable for panel rewiring and automation retrofits.",
    source: "erp_alert",
    status: "rfq_sent",
    priority: "high",
    currentStock: 2,
    reorderPoint: 8,
    maxStock: 40,
    avgDailyConsumption: 1.1,
    avgDailyConsumption30d: 1.4,
    avgDailyConsumption90d: 1.1,
    flaggedAt: "2026-03-09T09:35:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-005",
    stockHistory: generateStockHistory(2, 1.1, 90),
    activeRfqId: "rfq-003",
  },  // rfq_sent — waiting for supplier quotes
  {
    id: "pi-015",
    sku: "PNE-CYL-40-200",
    name: "Pneumatic Cylinder 40mm Bore x 200mm Stroke",
    description: "Double-acting pneumatic cylinder, 40mm bore, 200mm stroke, magnetic piston. For packaging line actuator replacement.",
    source: "manual_request",
    status: "flagged",
    priority: "high",
    currentStock: 2,
    reorderPoint: 5,
    maxStock: 30,
    avgDailyConsumption: 0.4,
    avgDailyConsumption30d: 0.6,
    avgDailyConsumption90d: 0.4,
    flaggedAt: "2026-03-12T09:45:00Z",
    requestedBy: "Sarah Chen",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-005",
    stockHistory: generateStockHistory(2, 0.4, 90),
  },
  {
    id: "pi-014",
    sku: "HYD-FLT-10M-SS",
    name: "10-Micron Hydraulic Filter Element (SS Mesh)",
    description: "Stainless steel mesh hydraulic filter element, 10-micron rating, for high-pressure hydraulic systems. Replaces disposable cellulose elements on Press Lines 1-4.",
    source: "erp_alert",
    status: "flagged",
    priority: "high",
    currentStock: 4,
    reorderPoint: 8,
    maxStock: 40,
    avgDailyConsumption: 0.8,
    avgDailyConsumption30d: 1.1,
    avgDailyConsumption90d: 0.8,
    flaggedAt: "2026-03-10T07:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "consumable",
    attachments: [],
    preferredSupplierId: "sup-003",
    stockHistory: generateStockHistory(4, 0.8, 90),
  },
];

// --- Supplier Item Histories ---

export const supplierItemHistories: SupplierItemHistory[] = [
  // pi-001: 304 SS Sheet — suppliers
  { id: "sih-001", supplierId: "sup-001", itemId: "pi-001", lastOrderDate: "2026-02-15", totalOrders12mo: 14, avgUnitPrice: 285.00, lastUnitPrice: 292.00, previousUnitPrice: 280.00, avgLeadTimeDays: 5, onTimeDeliveryRate: 97, defectRate: 0.3, reliabilityScore: 95, moq: 10, paymentTerms: "Net 30", notes: "Primary vendor. Consistent quality." },
  { id: "sih-002", supplierId: "sup-005", itemId: "pi-001", lastOrderDate: "2025-11-20", totalOrders12mo: 3, avgUnitPrice: 298.00, lastUnitPrice: 305.00, previousUnitPrice: 295.00, avgLeadTimeDays: 8, onTimeDeliveryRate: 88, defectRate: 1.2, reliabilityScore: 72, moq: 5, paymentTerms: "Net 30", notes: "Backup source. Higher pricing but lower MOQ." },

  // pi-002: Bearings — suppliers
  { id: "sih-003", supplierId: "sup-006", itemId: "pi-002", lastOrderDate: "2026-01-28", totalOrders12mo: 8, avgUnitPrice: 4.85, lastUnitPrice: 4.90, previousUnitPrice: 4.80, avgLeadTimeDays: 14, onTimeDeliveryRate: 98, defectRate: 0.1, reliabilityScore: 97, moq: 100, paymentTerms: "Net 60", notes: "Premium quality. Best for critical applications." },
  { id: "sih-004", supplierId: "sup-005", itemId: "pi-002", lastOrderDate: "2026-02-10", totalOrders12mo: 5, avgUnitPrice: 3.95, lastUnitPrice: 4.10, previousUnitPrice: 3.90, avgLeadTimeDays: 7, onTimeDeliveryRate: 91, defectRate: 2.4, reliabilityScore: 78, moq: 50, paymentTerms: "Net 30", notes: "Economy option. Acceptable for non-critical uses." },
  { id: "sih-005", supplierId: "sup-002", itemId: "pi-002", lastOrderDate: "2025-08-05", totalOrders12mo: 2, avgUnitPrice: 4.40, lastUnitPrice: 4.50, previousUnitPrice: 4.30, avgLeadTimeDays: 10, onTimeDeliveryRate: 85, defectRate: 1.8, reliabilityScore: 74, moq: 200, paymentTerms: "Net 45", notes: "Limited bearing stock. Better for fasteners." },

  // pi-003: Viton O-Rings — suppliers
  { id: "sih-006", supplierId: "sup-003", itemId: "pi-003", lastOrderDate: "2026-02-20", totalOrders12mo: 11, avgUnitPrice: 0.82, lastUnitPrice: 0.85, previousUnitPrice: 0.80, avgLeadTimeDays: 6, onTimeDeliveryRate: 94, defectRate: 0.8, reliabilityScore: 91, moq: 500, paymentTerms: "Net 30", notes: "Sole source for Viton grade. Good quality consistency." },
  { id: "sih-007", supplierId: "sup-005", itemId: "pi-003", lastOrderDate: "2025-09-14", totalOrders12mo: 2, avgUnitPrice: 0.95, lastUnitPrice: 0.98, previousUnitPrice: 0.92, avgLeadTimeDays: 10, onTimeDeliveryRate: 82, defectRate: 3.5, reliabilityScore: 62, moq: 200, paymentTerms: "Net 30", notes: "Generic replacement. Higher defect rate." },

  // pi-004: Hex Bolts — suppliers
  { id: "sih-008", supplierId: "sup-002", itemId: "pi-004", lastOrderDate: "2026-03-01", totalOrders12mo: 18, avgUnitPrice: 0.12, lastUnitPrice: 0.11, previousUnitPrice: 0.12, avgLeadTimeDays: 4, onTimeDeliveryRate: 96, defectRate: 0.2, reliabilityScore: 96, moq: 5000, paymentTerms: "Net 45", notes: "Best price for fasteners in volume." },
  { id: "sih-009", supplierId: "sup-005", itemId: "pi-004", lastOrderDate: "2026-02-15", totalOrders12mo: 6, avgUnitPrice: 0.14, lastUnitPrice: 0.14, previousUnitPrice: 0.15, avgLeadTimeDays: 3, onTimeDeliveryRate: 93, defectRate: 0.5, reliabilityScore: 89, moq: 1000, paymentTerms: "Net 30", notes: "Quick delivery. Good for urgent small orders." },

  // pi-005: Copper Tube — suppliers
  { id: "sih-010", supplierId: "sup-007", itemId: "pi-005", lastOrderDate: "2026-01-10", totalOrders12mo: 6, avgUnitPrice: 42.50, lastUnitPrice: 44.00, previousUnitPrice: 41.00, avgLeadTimeDays: 7, onTimeDeliveryRate: 95, defectRate: 0.2, reliabilityScore: 94, moq: 20, paymentTerms: "Net 30", notes: "Specialist copper supplier. Consistent stock." },
  { id: "sih-011", supplierId: "sup-005", itemId: "pi-005", lastOrderDate: "2025-07-22", totalOrders12mo: 1, avgUnitPrice: 48.00, lastUnitPrice: 48.00, previousUnitPrice: 48.00, avgLeadTimeDays: 12, onTimeDeliveryRate: 78, defectRate: 1.0, reliabilityScore: 64, moq: 10, paymentTerms: "Net 30", notes: "Emergency backup. Premium pricing." },

  // pi-006: Flap Discs — suppliers
  { id: "sih-012", supplierId: "sup-008", itemId: "pi-006", lastOrderDate: "2026-02-28", totalOrders12mo: 12, avgUnitPrice: 3.20, lastUnitPrice: 3.15, previousUnitPrice: 3.25, avgLeadTimeDays: 3, onTimeDeliveryRate: 99, defectRate: 0.4, reliabilityScore: 97, moq: 50, paymentTerms: "Net 45", notes: "Primary abrasives vendor. Excellent service." },

  // pi-007: Custom Bracket — suppliers
  { id: "sih-013", supplierId: "sup-004", itemId: "pi-007", lastOrderDate: "2025-12-18", totalOrders12mo: 4, avgUnitPrice: 68.00, lastUnitPrice: 72.00, previousUnitPrice: 65.00, avgLeadTimeDays: 18, onTimeDeliveryRate: 92, defectRate: 1.5, reliabilityScore: 85, moq: 25, paymentTerms: "Net 60", notes: "Good 5-axis CNC capability. Quality improving." },

  // pi-008: Drive Shaft — suppliers
  { id: "sih-014", supplierId: "sup-004", itemId: "pi-008", lastOrderDate: "2025-10-22", totalOrders12mo: 2, avgUnitPrice: 340.00, lastUnitPrice: 355.00, previousUnitPrice: 325.00, avgLeadTimeDays: 25, onTimeDeliveryRate: 90, defectRate: 2.0, reliabilityScore: 80, moq: 5, paymentTerms: "Net 60", notes: "Only local source for precision grinding. Capacity constrained." },
  { id: "sih-015", supplierId: "sup-001", itemId: "pi-008", lastOrderDate: "2025-06-15", totalOrders12mo: 1, avgUnitPrice: 310.00, lastUnitPrice: 310.00, previousUnitPrice: 310.00, avgLeadTimeDays: 30, onTimeDeliveryRate: 85, defectRate: 3.0, reliabilityScore: 70, moq: 10, paymentTerms: "Net 30", notes: "Can subcontract grinding. Longer lead time." },

  // pi-009: Aluminum Bar — suppliers
  { id: "sih-016", supplierId: "sup-001", itemId: "pi-009", lastOrderDate: "2026-02-05", totalOrders12mo: 7, avgUnitPrice: 38.50, lastUnitPrice: 39.00, previousUnitPrice: 38.00, avgLeadTimeDays: 5, onTimeDeliveryRate: 97, defectRate: 0.2, reliabilityScore: 96, moq: 10, paymentTerms: "Net 30", notes: "Standard aluminum supplier. Always in stock." },

  // pi-010: Liner Plate — suppliers
  { id: "sih-017", supplierId: "sup-001", itemId: "pi-010", lastOrderDate: "2025-11-01", totalOrders12mo: 3, avgUnitPrice: 185.00, lastUnitPrice: 190.00, previousUnitPrice: 180.00, avgLeadTimeDays: 10, onTimeDeliveryRate: 93, defectRate: 1.0, reliabilityScore: 88, moq: 5, paymentTerms: "Net 30", notes: "Can plasma-cut in house. Good AR400 stock." },

  // pi-011: Grease — suppliers
  { id: "sih-018", supplierId: "sup-005", itemId: "pi-011", lastOrderDate: "2026-02-22", totalOrders12mo: 9, avgUnitPrice: 6.80, lastUnitPrice: 6.95, previousUnitPrice: 6.75, avgLeadTimeDays: 3, onTimeDeliveryRate: 97, defectRate: 0, reliabilityScore: 98, moq: 12, paymentTerms: "Net 30", notes: "Standard consumable. Always available." },

  // pi-012: Welding Wire — suppliers
  { id: "sih-019", supplierId: "sup-005", itemId: "pi-012", lastOrderDate: "2026-02-18", totalOrders12mo: 10, avgUnitPrice: 52.00, lastUnitPrice: 54.00, previousUnitPrice: 51.00, avgLeadTimeDays: 4, onTimeDeliveryRate: 95, defectRate: 0.1, reliabilityScore: 95, moq: 5, paymentTerms: "Net 30", notes: "Good Lincoln & Hobart stock." },
  { id: "sih-020", supplierId: "sup-002", itemId: "pi-012", lastOrderDate: "2025-12-01", totalOrders12mo: 3, avgUnitPrice: 49.50, lastUnitPrice: 50.00, previousUnitPrice: 49.00, avgLeadTimeDays: 6, onTimeDeliveryRate: 88, defectRate: 0.5, reliabilityScore: 84, moq: 10, paymentTerms: "Net 45", notes: "Slightly cheaper but less reliable shipping." },

  // pi-014: Hydraulic Filter — suppliers
  { id: "sih-021", supplierId: "sup-003", itemId: "pi-014", lastOrderDate: "2026-01-22", totalOrders12mo: 6, avgUnitPrice: 145.00, lastUnitPrice: 148.00, previousUnitPrice: 142.00, avgLeadTimeDays: 8, onTimeDeliveryRate: 96, defectRate: 0.5, reliabilityScore: 93, moq: 4, paymentTerms: "Net 30", notes: "Primary source for hydraulic filtration. Consistent quality, stocks SS mesh elements." },
  { id: "sih-022", supplierId: "sup-005", itemId: "pi-014", lastOrderDate: "2025-10-15", totalOrders12mo: 2, avgUnitPrice: 158.00, lastUnitPrice: 162.00, previousUnitPrice: 155.00, avgLeadTimeDays: 12, onTimeDeliveryRate: 85, defectRate: 2.0, reliabilityScore: 70, moq: 2, paymentTerms: "Net 30", notes: "Generic replacement element. Lower MOQ but higher defect rate." },
  { id: "sih-023", supplierId: "sup-001", itemId: "pi-014", lastOrderDate: "2025-08-01", totalOrders12mo: 1, avgUnitPrice: 165.00, lastUnitPrice: 165.00, previousUnitPrice: 165.00, avgLeadTimeDays: 15, onTimeDeliveryRate: 90, defectRate: 1.0, reliabilityScore: 76, moq: 5, paymentTerms: "Net 30", notes: "Can source through distribution network. Longer lead time." },
];

// --- Co-Order Patterns ---

export const coOrderPatterns: CoOrderPattern[] = [
  { id: "cop-001", itemId: "pi-001", coItemId: "pi-009", coOrderFrequencyPct: 72 },
  { id: "cop-002", itemId: "pi-001", coItemId: "pi-012", coOrderFrequencyPct: 58 },
  { id: "cop-003", itemId: "pi-002", coItemId: "pi-011", coOrderFrequencyPct: 82 },
  { id: "cop-004", itemId: "pi-004", coItemId: "pi-002", coOrderFrequencyPct: 65 },
  { id: "cop-005", itemId: "pi-004", coItemId: "pi-006", coOrderFrequencyPct: 48 },
  { id: "cop-006", itemId: "pi-005", coItemId: "pi-003", coOrderFrequencyPct: 55 },
  { id: "cop-007", itemId: "pi-009", coItemId: "pi-001", coOrderFrequencyPct: 72 },
  { id: "cop-008", itemId: "pi-012", coItemId: "pi-006", coOrderFrequencyPct: 88 },
  { id: "cop-009", itemId: "pi-012", coItemId: "pi-001", coOrderFrequencyPct: 58 },
  { id: "cop-010", itemId: "pi-003", coItemId: "pi-011", coOrderFrequencyPct: 45 },
  { id: "cop-011", itemId: "pi-006", coItemId: "pi-012", coOrderFrequencyPct: 88 },
  { id: "cop-012", itemId: "pi-011", coItemId: "pi-002", coOrderFrequencyPct: 82 },
  { id: "cop-013", itemId: "pi-014", coItemId: "pi-003", coOrderFrequencyPct: 68 },
  { id: "cop-014", itemId: "pi-014", coItemId: "pi-011", coOrderFrequencyPct: 52 },
];

// --- Engineering Requests ---

export const engineeringRequests: EngineeringRequest[] = [
  {
    id: "er-001",
    itemId: "pi-007",
    requesterName: "Tom Nakamura",
    requesterTeam: "Mechanical Engineering",
    description: "Need custom mounting brackets for the new Series 7 conveyor module we're designing. These brackets interface between the drive unit and the frame structure. Critical path item — we need prototypes by end of March for the assembly trial.",
    urgency: "urgent",
    specs: {
      material: "6061-T6 Aluminum",
      dimensions: "240mm x 85mm x 45mm",
      tolerances: "±0.05mm on mounting holes",
      finish: "Clear anodize, Type II",
      compliance: "ISO 2768-mK",
    },
    attachments: [
      { id: "att-e1", fileName: "bracket-assembly-rev3.pdf", fileType: "pdf", fileSize: 2_450_000, url: "#" },
      { id: "att-e2", fileName: "bracket-mounting-detail.dwg", fileType: "dwg", fileSize: 890_000, url: "#" },
      { id: "att-e3", fileName: "series7-interface-spec.pdf", fileType: "pdf", fileSize: 1_200_000, url: "#" },
    ],
    submittedAt: "2026-03-08T10:30:00Z",
    classificationTags: ["Custom Part", "CNC Machined", "Prototype"],
  },
  {
    id: "er-002",
    itemId: "pi-008",
    requesterName: "Rachel Kim",
    requesterTeam: "Production Engineering",
    description: "Replacement drive shaft for Press Line 3. The existing shaft failed fatigue inspection and must be replaced during the scheduled maintenance window (March 20-22). This is a direct replacement but we've updated the material spec to improve fatigue life.",
    urgency: "critical",
    specs: {
      material: "AISI 4140 Steel, through-hardened to 28-32 HRC",
      dimensions: "Ø45mm x 680mm overall length",
      tolerances: "±0.01mm on journal diameters, ±0.02mm on keyway",
      grade: "ASTM A193 Grade B7",
      finish: "Ground to Ra 0.8μm on bearing journals",
      compliance: "AGMA 2000-A88 Class 10",
    },
    attachments: [
      { id: "att-e4", fileName: "drive-shaft-drawing-v2.pdf", fileType: "pdf", fileSize: 3_100_000, url: "#" },
      { id: "att-e5", fileName: "shaft-3d-model.step", fileType: "step", fileSize: 5_400_000, url: "#" },
    ],
    submittedAt: "2026-03-06T15:20:00Z",
    classificationTags: ["Custom Part", "Precision Ground", "Maintenance Critical"],
  },
  {
    id: "er-003",
    itemId: "pi-010",
    requesterName: "Derek Patel",
    requesterTeam: "Plant Maintenance",
    description: "Replacement liner plates for the aggregate feed chute. Current liners are worn through in three spots and causing material spillage. Need plasma-cut to the existing template profile.",
    urgency: "routine",
    specs: {
      material: "AR400 Abrasion-Resistant Steel",
      dimensions: "1200mm x 600mm x 12mm thick",
      tolerances: "±2mm on cut profile",
      finish: "Mill finish, deburr all edges",
    },
    attachments: [
      { id: "att-e6", fileName: "liner-plate-template.dxf", fileType: "dxf", fileSize: 340_000, url: "#" },
    ],
    submittedAt: "2026-03-09T08:15:00Z",
    classificationTags: ["Raw Material", "Plasma Cut"],
  },
];

// --- Draft RFQs ---

export const draftRFQs: DraftRFQ[] = [
  {
    id: "rfq-001",
    itemId: "pi-003",
    supplierIds: ["sup-003"],
    quantity: 2000,
    deliveryDate: "2026-03-25",
    specs: {},
    attachments: [],
    status: "draft",
    createdAt: "2026-03-06T09:00:00Z",
    sentAt: null,
    buyerCompany: "Hexa Manufacturing Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexamfg.com",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "Please confirm Viton 75A durometer availability. We can accept partial shipments.",
  },
  {
    id: "rfq-002",
    itemId: "pi-005",
    supplierIds: ["sup-007"],
    quantity: 60,
    deliveryDate: "2026-03-20",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-03-02T14:00:00Z",
    sentAt: "2026-03-02T16:30:00Z",
    buyerCompany: "Hexa Manufacturing Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexamfg.com",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "",
  },
  {
    id: "rfq-003",
    itemId: "pi-013",
    supplierIds: ["sup-005", "sup-002"],
    quantity: 20,
    deliveryDate: "2026-03-25",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-03-09T13:00:00Z",
    sentAt: "2026-03-09T14:00:00Z",
    buyerCompany: "Hexa Manufacturing Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexamfg.com",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "Urgent — current stock critically low.",
  },
  {
    id: "rfq-006",
    itemId: "pi-006",
    supplierIds: ["sup-008", "sup-005"],
    quantity: 500,
    deliveryDate: "2026-03-08",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-02-25T11:00:00Z",
    sentAt: "2026-02-25T14:00:00Z",
    buyerCompany: "Hexa Manufacturing Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexamfg.com",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 45",
    validityDays: 14,
    notes: "Urgent restock — consumption rate increasing due to expanded weld-prep schedule.",
  },
  {
    id: "rfq-004",
    itemId: "pi-004",
    supplierIds: ["sup-002", "sup-005"],
    quantity: 10000,
    deliveryDate: "2026-03-20",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-03-06T18:00:00Z",
    sentAt: "2026-03-07T10:00:00Z",
    buyerCompany: "Hexa Manufacturing Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexamfg.com",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 45",
    validityDays: 14,
    notes: "",
  },
];

// --- RFQ Supplier Entries (tracking per-supplier RFQ status) ---

export const rfqSupplierEntries: Record<string, RFQSupplierEntry[]> = {
  "rfq-006": [
    { supplierId: "sup-008", sentAt: "2026-02-25T14:00:00Z", responseStatus: "quote_received", quoteId: "sq-006-a" },
    { supplierId: "sup-005", sentAt: "2026-02-25T14:00:00Z", responseStatus: "quote_received", quoteId: "sq-006-b" },
  ],
  "rfq-003": [
    { supplierId: "sup-005", sentAt: "2026-03-09T14:00:00Z", responseStatus: "no_response" },
    { supplierId: "sup-002", sentAt: "2026-03-09T14:00:00Z", responseStatus: "no_response" },
  ],
  "rfq-004": [
    { supplierId: "sup-002", sentAt: "2026-03-07T10:00:00Z", responseStatus: "quote_received", quoteId: "sq-001" },
    { supplierId: "sup-005", sentAt: "2026-03-07T10:00:00Z", responseStatus: "quote_received", quoteId: "sq-002" },
  ],
};

// --- Supplier Quotes ---

export const supplierQuotes: SupplierQuote[] = [
  {
    id: "sq-006-a",
    rfqId: "rfq-006",
    supplierId: "sup-008",
    unitPrice: 3.15,
    totalPrice: 1575,
    leadTimeDays: 3,
    moq: 50,
    paymentTerms: "Net 45",
    deliveryTerms: "FOB Origin",
    validUntil: "2026-03-11",
    receivedAt: "2026-02-26T10:30:00Z",
    notes: "Full stock available. Can ship same day on PO receipt.",
  },
  {
    id: "sq-006-b",
    rfqId: "rfq-006",
    supplierId: "sup-005",
    unitPrice: 3.45,
    totalPrice: 1725,
    leadTimeDays: 5,
    moq: 25,
    paymentTerms: "Net 30",
    deliveryTerms: "Delivered",
    validUntil: "2026-03-11",
    receivedAt: "2026-02-27T09:00:00Z",
    notes: "Lower MOQ, delivered pricing. Slightly higher unit cost.",
  },
  {
    id: "sq-001",
    rfqId: "rfq-004",
    supplierId: "sup-002",
    unitPrice: 0.11,
    totalPrice: 1100,
    leadTimeDays: 4,
    moq: 5000,
    paymentTerms: "Net 45",
    deliveryTerms: "FOB Origin",
    validUntil: "2026-03-21",
    receivedAt: "2026-03-08T16:30:00Z",
    notes: "In stock, can ship within 2 business days of PO.",
  },
  {
    id: "sq-002",
    rfqId: "rfq-004",
    supplierId: "sup-005",
    unitPrice: 0.14,
    totalPrice: 1400,
    leadTimeDays: 3,
    moq: 1000,
    paymentTerms: "Net 30",
    deliveryTerms: "Delivered",
    validUntil: "2026-03-21",
    receivedAt: "2026-03-09T09:15:00Z",
    notes: "Faster delivery, lower MOQ. Delivered pricing includes freight.",
  },
];

// --- Purchase Orders ---

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "pur-006",
    itemId: "pi-006",
    supplierId: "sup-008",
    quoteId: "sq-006-a",
    quantity: 500,
    unitPrice: 3.15,
    totalPrice: 1575,
    paymentTerms: "Net 45",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-04",
    status: "sent",
    createdAt: "2026-02-27T14:00:00Z",
    sentAt: "2026-02-27T16:00:00Z",
    shipmentId: "shp-proc-006",
  },
  {
    id: "pur-011",
    itemId: "pi-011",
    supplierId: "sup-005",
    quantity: 152,
    unitPrice: 6.95,
    totalPrice: 1056.40,
    paymentTerms: "Net 30",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-17",
    status: "sent",
    createdAt: "2026-03-10T09:00:00Z",
    sentAt: "2026-03-10T09:15:00Z",
  },
  {
    id: "pur-001",
    itemId: "pi-007",
    supplierId: "sup-004",
    quantity: 50,
    unitPrice: 72.00,
    totalPrice: 3600,
    paymentTerms: "Net 60",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-22",
    status: "sent",
    createdAt: "2026-03-04T10:00:00Z",
    sentAt: "2026-03-04T14:30:00Z",
  },
  {
    id: "pur-002",
    itemId: "pi-008",
    supplierId: "sup-004",
    quantity: 5,
    unitPrice: 355.00,
    totalPrice: 1775,
    paymentTerms: "Net 60",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-18",
    status: "sent",
    createdAt: "2026-02-24T09:00:00Z",
    sentAt: "2026-02-24T11:00:00Z",
    shipmentId: "shp-proc-001",
  },
];

// --- Open POs ---

export const openPOs: OpenPO[] = [
  {
    id: "po-001",
    itemId: "pi-005",
    supplierId: "sup-007",
    quantity: 60,
    orderDate: "2026-03-03",
    expectedDelivery: "2026-03-14",
    status: "shipped",
    trackingRef: "SCW-2026-4418",
  },
  {
    id: "po-002",
    itemId: "pi-006",
    supplierId: "sup-008",
    quantity: 200,
    orderDate: "2026-03-01",
    expectedDelivery: "2026-03-10",
    status: "in_transit",
    trackingRef: "PA-INV-88721",
  },
  {
    id: "po-003",
    itemId: "pi-002",
    supplierId: "sup-006",
    quantity: 300,
    orderDate: "2026-03-07",
    expectedDelivery: "2026-03-21",
    status: "confirmed",
  },
];

// --- ERP Scan Config ---

export const defaultERPScanConfig: ERPScanConfig = {
  scanFrequency: "1hr",
  reorderPointSource: "erp",
  alertInApp: true,
  alertEmail: false,
  watchedItemIds: ["pi-001", "pi-002", "pi-003", "pi-004", "pi-005", "pi-006", "pi-009", "pi-011", "pi-012", "pi-013"],
  customReorderPoints: {},
};

// --- Helper functions ---

export function getSupplier(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getSupplierHistoriesForItem(itemId: string): (SupplierItemHistory & { supplier: Supplier })[] {
  return supplierItemHistories
    .filter((h) => h.itemId === itemId)
    .map((h) => ({ ...h, supplier: suppliers.find((s) => s.id === h.supplierId)! }))
    .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
}

export function getCoOrderItems(itemId: string): (CoOrderPattern & { item: ProcurementItem })[] {
  return coOrderPatterns
    .filter((p) => p.itemId === itemId)
    .map((p) => ({ ...p, item: procurementItems.find((i) => i.id === p.coItemId)! }))
    .filter((p) => p.item)
    .sort((a, b) => b.coOrderFrequencyPct - a.coOrderFrequencyPct);
}

export function getEngineeringRequest(itemId: string): EngineeringRequest | undefined {
  return engineeringRequests.find((r) => r.itemId === itemId);
}

export function getDraftRFQ(rfqId: string): DraftRFQ | undefined {
  return draftRFQs.find((r) => r.id === rfqId);
}

export function getDaysOfStockRemaining(item: ProcurementItem): number {
  if (item.avgDailyConsumption === 0) return Infinity;
  return Math.round(item.currentStock / item.avgDailyConsumption);
}

export function getStockColor(days: number): "red" | "amber" | "green" {
  if (days <= 7) return "red";
  if (days <= 14) return "amber";
  return "green";
}

export function getItemsForSameSupplier(itemId: string, supplierId: string): ProcurementItem[] {
  return procurementItems.filter(
    (i) => i.id !== itemId && i.preferredSupplierId === supplierId && i.status === "flagged"
  );
}

export function getOpenPOsForItem(itemId: string): (OpenPO & { supplier: Supplier })[] {
  return openPOs
    .filter((po) => po.itemId === itemId)
    .map((po) => ({ ...po, supplier: suppliers.find((s) => s.id === po.supplierId)! }))
    .filter((po) => po.supplier);
}

export function getBestLeadTime(itemId: string): number {
  const histories = supplierItemHistories.filter((h) => h.itemId === itemId);
  if (histories.length === 0) return Infinity;
  return Math.min(...histories.map((h) => h.avgLeadTimeDays));
}

export function hasSupplierHistory(itemId: string): boolean {
  return supplierItemHistories.some((h) => h.itemId === itemId);
}

export function getRFQSupplierEntries(rfqId: string): (RFQSupplierEntry & { supplier: Supplier })[] {
  const entries = rfqSupplierEntries[rfqId] ?? [];
  return entries
    .map((e) => ({ ...e, supplier: suppliers.find((s) => s.id === e.supplierId)! }))
    .filter((e) => e.supplier);
}

export function getQuotesForRFQ(rfqId: string): (SupplierQuote & { supplier: Supplier })[] {
  return supplierQuotes
    .filter((q) => q.rfqId === rfqId)
    .map((q) => ({ ...q, supplier: suppliers.find((s) => s.id === q.supplierId)! }))
    .filter((q) => q.supplier);
}

export function getPurchaseOrder(poId: string): (PurchaseOrder & { supplier: Supplier }) | undefined {
  const po = purchaseOrders.find((p) => p.id === poId);
  if (!po) return undefined;
  const supplier = suppliers.find((s) => s.id === po.supplierId);
  if (!supplier) return undefined;
  return { ...po, supplier };
}

export function getDraftRFQForItem(itemId: string): DraftRFQ | undefined {
  return draftRFQs.find((r) => r.itemId === itemId);
}

export function getQuoteById(quoteId: string): (SupplierQuote & { supplier: Supplier }) | undefined {
  const q = supplierQuotes.find((sq) => sq.id === quoteId);
  if (!q) return undefined;
  const supplier = suppliers.find((s) => s.id === q.supplierId);
  if (!supplier) return undefined;
  return { ...q, supplier };
}
