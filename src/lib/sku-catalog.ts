import { CatalogItem } from "./types";

export interface SkuCatalogEntry extends CatalogItem {
  category: string;
  tags: string[];
}

function e(
  catalogSku: string,
  catalogName: string,
  catalogDescription: string,
  catalogPrice: number,
  catalogUom: string,
  category: string,
  tags: string[]
): SkuCatalogEntry {
  return { catalogSku, catalogName, catalogDescription, catalogPrice, catalogUom, category, tags };
}

export const skuCatalog: SkuCatalogEntry[] = [
  // ── Bearings & Bearing Kits ──────────────────────────────────────────
  e("IBK-200", "Industrial Bearing Kit 200-Series", "Light-duty bearing set for small machinery. 4 bearings per kit.", 45.00, "kit", "Bearings", ["industrial", "precision", "light-duty", "machinery"]),
  e("IBK-300", "Industrial Bearing Kit 300-Series", "Medium-duty bearing set for general industrial use. 6 bearings per kit.", 67.50, "kit", "Bearings", ["industrial", "precision", "medium-duty", "machinery"]),
  e("IBK-400", "Industrial Bearing Kit 400-Series", "Precision bearing set for heavy-duty machinery. Includes 8 bearings per kit.", 89.50, "kit", "Bearings", ["industrial", "precision", "heavy-duty", "machinery"]),
  e("IBK-500", "Industrial Bearing Kit 500-Series", "High-performance bearing set for extreme load applications. 10 bearings per kit.", 112.00, "kit", "Bearings", ["industrial", "precision", "extreme-load", "machinery"]),
  e("IBK-600", "Industrial Bearing Kit 600-Series", "Premium bearing set for continuous-duty industrial equipment. 12 bearings per kit.", 145.00, "kit", "Bearings", ["industrial", "premium", "continuous-duty", "machinery"]),
  e("BB-6204", "Ball Bearing 6204-2RS", "Deep groove ball bearing, 20x47x14mm, double rubber sealed.", 4.25, "each", "Bearings", ["ball bearing", "sealed", "deep groove", "6204"]),
  e("BB-6205", "Ball Bearing 6205-2RS", "Deep groove ball bearing, 25x52x15mm, double rubber sealed.", 5.10, "each", "Bearings", ["ball bearing", "sealed", "deep groove", "6205"]),
  e("BB-6206", "Ball Bearing 6206-2RS", "Deep groove ball bearing, 30x62x16mm, double rubber sealed.", 6.75, "each", "Bearings", ["ball bearing", "sealed", "deep groove", "6206"]),
  e("RB-NJ-205", "Roller Bearing NJ 205", "Cylindrical roller bearing, 25x52x15mm, single row.", 18.50, "each", "Bearings", ["roller bearing", "cylindrical", "NJ205"]),
  e("RB-NJ-206", "Roller Bearing NJ 206", "Cylindrical roller bearing, 30x62x16mm, single row.", 22.00, "each", "Bearings", ["roller bearing", "cylindrical", "NJ206"]),
  e("TB-51105", "Thrust Bearing 51105", "Single direction thrust ball bearing, 25x42x11mm.", 8.90, "each", "Bearings", ["thrust bearing", "axial", "51105"]),

  // ── Flanges & Fittings ───────────────────────────────────────────────
  e("SF-2-150", 'SS Flange 2" 150lb', "2-inch stainless steel flange, 150 lb pressure class, ANSI B16.5.", 12.50, "each", "Flanges", ["stainless steel", "flange", "2-inch", "150lb", "ANSI"]),
  e("SF-2-300", 'SS Flange 2" 300lb', "2-inch stainless steel flange, 300 lb pressure class, ANSI B16.5.", 24.00, "each", "Flanges", ["stainless steel", "flange", "2-inch", "300lb", "ANSI"]),
  e("SF-3-150", 'SS Flange 3" 150lb', "3-inch stainless steel flange, 150 lb pressure class.", 18.75, "each", "Flanges", ["stainless steel", "flange", "3-inch", "150lb"]),
  e("SF-3-300", 'SS Flange 3" 300lb', "3-inch stainless steel flange, 300 lb pressure class.", 34.00, "each", "Flanges", ["stainless steel", "flange", "3-inch", "300lb"]),
  e("SF-4-150", 'SS Flange 4" 150lb', "4-inch stainless steel flange, 150 lb pressure class.", 28.00, "each", "Flanges", ["stainless steel", "flange", "4-inch", "150lb"]),
  e("SF-4-300", 'SS Flange 4" 300lb', "4-inch stainless steel flange, 300 lb pressure class.", 48.00, "each", "Flanges", ["stainless steel", "flange", "4-inch", "300lb"]),
  e("CF-3-WN", 'Carbon Flange 3" Weld-Neck', "3-inch carbon steel weld-neck flange, schedule 40.", 22.00, "each", "Flanges", ["carbon steel", "flange", "3-inch", "weld-neck"]),
  e("CF-4-WN", 'Carbon Flange 4" Weld-Neck', "4-inch carbon steel weld-neck flange, schedule 40.", 35.00, "each", "Flanges", ["carbon steel", "flange", "4-inch", "weld-neck"]),
  e("BF-2-SO", 'Brass Flange 2" Slip-On', "2-inch brass slip-on flange for low-pressure systems.", 15.50, "each", "Flanges", ["brass", "flange", "2-inch", "slip-on"]),
  e("BF-3-SO", 'Brass Flange 3" Slip-On', "3-inch brass slip-on flange for low-pressure systems.", 21.00, "each", "Flanges", ["brass", "flange", "3-inch", "slip-on"]),
  e("GK-FL-2", 'Flange Gasket Kit 2"', "Complete gasket kit for 2-inch flanges, includes bolts and nuts.", 2.75, "set", "Flanges", ["gasket", "flange", "2-inch", "kit"]),
  e("GK-FL-3", 'Flange Gasket Kit 3"', "Complete gasket kit for 3-inch flanges, includes bolts and nuts.", 3.50, "set", "Flanges", ["gasket", "flange", "3-inch", "kit"]),
  e("GK-FL-4", 'Flange Gasket Kit 4"', "Complete gasket kit for 4-inch flanges, includes bolts and nuts.", 4.25, "set", "Flanges", ["gasket", "flange", "4-inch", "kit"]),

  // ── Bolts & Fasteners ────────────────────────────────────────────────
  e("HB-M8-30", "Hex Bolt M8x30mm 25-Pack", "Grade 8.8 hex bolt, M8 thread, 30mm length. 25 per pack.", 3.80, "pack", "Fasteners", ["hex bolt", "M8", "grade 8.8", "30mm"]),
  e("HB-M10-40", "Hex Bolt M10x40mm 25-Pack", "Grade 8.8 hex bolt, M10 thread, 40mm length. 25 per pack.", 4.50, "pack", "Fasteners", ["hex bolt", "M10", "grade 8.8", "40mm"]),
  e("HB-M12-50", "Hex Bolt M12x50mm 25-Pack", "Grade 8.8 hex bolt, M12 thread, 50mm length. 25 per pack.", 6.20, "pack", "Fasteners", ["hex bolt", "M12", "grade 8.8", "50mm"]),
  e("HB-M16-60", "Hex Bolt M16x60mm 25-Pack", "Grade 8.8 hex bolt, M16 thread, 60mm length. 25 per pack.", 9.40, "pack", "Fasteners", ["hex bolt", "M16", "grade 8.8", "60mm"]),
  e("SB-M8-200", "Steel Bolt M8 200-Pack", "Grade 8 steel bolts, M8 thread, 200 per box.", 14.50, "pack", "Fasteners", ["steel bolt", "M8", "bulk", "grade 8"]),
  e("CF-250", "Copper Fastener 250-Count Bag", "High-quality copper fasteners, 250 per bag. Corrosion resistant.", 8.75, "bag", "Fasteners", ["copper", "fastener", "corrosion resistant", "bulk"]),
  e("CF-500", "Copper Fastener 500-Count Bag", "High-quality copper fasteners, 500 per bag. Corrosion resistant.", 15.50, "bag", "Fasteners", ["copper", "fastener", "corrosion resistant", "bulk"]),
  e("SS-SCR-100", "Stainless Steel Screw 100-Pack", "18-8 stainless steel Phillips head screws, #8 x 1 inch.", 7.20, "pack", "Fasteners", ["stainless steel", "screw", "Phillips", "#8"]),
  e("SS-SCR-200", "Stainless Steel Screw 200-Pack", "18-8 stainless steel Phillips head screws, #8 x 1 inch.", 12.80, "pack", "Fasteners", ["stainless steel", "screw", "Phillips", "#8", "bulk"]),
  e("NW-100", "Nylon Washer 100-Count", "Standard nylon washers, 100 per bag.", 6.25, "bag", "Fasteners", ["nylon", "washer", "insulating"]),
  e("NW-200", "Nylon Washer 200-Count", "Standard nylon washers, 200 per bag.", 11.00, "bag", "Fasteners", ["nylon", "washer", "insulating", "bulk"]),
  e("LN-M10-50", "Lock Nut M10 50-Pack", "Prevailing torque lock nut, M10, zinc plated.", 5.60, "pack", "Fasteners", ["lock nut", "M10", "zinc plated"]),
  e("LN-M12-50", "Lock Nut M12 50-Pack", "Prevailing torque lock nut, M12, zinc plated.", 7.20, "pack", "Fasteners", ["lock nut", "M12", "zinc plated"]),
  e("FW-M10-100", "Flat Washer M10 100-Pack", "Zinc plated flat washers, M10 size.", 3.90, "pack", "Fasteners", ["flat washer", "M10", "zinc plated"]),
  e("SW-M10-100", "Spring Washer M10 100-Pack", "Zinc plated spring lock washers, M10 size.", 4.50, "pack", "Fasteners", ["spring washer", "M10", "zinc plated", "lock"]),

  // ── Valves & Assemblies ──────────────────────────────────────────────
  e("VA-200", "Check Valve Assembly 2-inch Brass", "2-inch brass check valve for low-pressure residential systems.", 95.00, "unit", "Valves", ["check valve", "brass", "2-inch", "residential"]),
  e("VA-250", "Check Valve Assembly 2.5-inch SS", "2.5-inch stainless steel check valve for industrial high-pressure systems.", 155.00, "unit", "Valves", ["check valve", "stainless steel", "2.5-inch", "industrial"]),
  e("VA-300", "Check Valve Assembly 3-inch SS", "3-inch stainless steel check valve for heavy industrial applications.", 210.00, "unit", "Valves", ["check valve", "stainless steel", "3-inch", "industrial"]),
  e("GV-2-BR", 'Gate Valve 2" Brass', "2-inch brass gate valve, 200 WOG rated.", 42.00, "unit", "Valves", ["gate valve", "brass", "2-inch"]),
  e("GV-3-BR", 'Gate Valve 3" Brass', "3-inch brass gate valve, 200 WOG rated.", 68.00, "unit", "Valves", ["gate valve", "brass", "3-inch"]),
  e("GV-2-SS", 'Gate Valve 2" Stainless', "2-inch stainless steel gate valve, 1000 WOG rated.", 78.00, "unit", "Valves", ["gate valve", "stainless steel", "2-inch"]),
  e("BV-1-BR", 'Ball Valve 1" Brass', "1-inch brass ball valve, full port, 600 WOG.", 18.50, "unit", "Valves", ["ball valve", "brass", "1-inch", "full port"]),
  e("BV-2-BR", 'Ball Valve 2" Brass', "2-inch brass ball valve, full port, 600 WOG.", 32.00, "unit", "Valves", ["ball valve", "brass", "2-inch", "full port"]),
  e("BV-2-SS", 'Ball Valve 2" Stainless', "2-inch stainless steel ball valve, full port, 1000 WOG.", 55.00, "unit", "Valves", ["ball valve", "stainless steel", "2-inch", "full port"]),
  e("PRV-2", 'Pressure Relief Valve 2"', "2-inch pressure relief valve, adjustable 25-150 PSI.", 125.00, "unit", "Valves", ["pressure relief", "safety", "2-inch", "adjustable"]),
  e("PRV-3", 'Pressure Relief Valve 3"', "3-inch pressure relief valve, adjustable 25-150 PSI.", 185.00, "unit", "Valves", ["pressure relief", "safety", "3-inch", "adjustable"]),
  e("SV-1-BR", 'Solenoid Valve 1" Brass 24V', "1-inch brass solenoid valve, 24V DC, normally closed.", 65.00, "unit", "Valves", ["solenoid", "brass", "1-inch", "24V", "electric"]),
  e("SV-2-SS", 'Solenoid Valve 2" SS 24V', "2-inch stainless steel solenoid valve, 24V DC, normally closed.", 120.00, "unit", "Valves", ["solenoid", "stainless steel", "2-inch", "24V", "electric"]),

  // ── Seals & Gaskets ──────────────────────────────────────────────────
  e("RS-STD-50", "Rubber Seal Standard 50-Pack", "Industrial rubber seals, 50 per pack.", 15.00, "pack", "Seals & Gaskets", ["rubber", "seal", "standard", "industrial"]),
  e("RS-HD-10", "Rubber Seal Heavy Duty 10-Pack", "Heavy duty rubber seals for high pressure, 10 per pack.", 22.00, "pack", "Seals & Gaskets", ["rubber", "seal", "heavy duty", "high pressure"]),
  e("RS-SM-100", "Rubber Seal Small 100-Pack", "Small profile rubber seals for compact fittings.", 12.00, "pack", "Seals & Gaskets", ["rubber", "seal", "small", "compact"]),
  e("GK-STD-25", "Gasket Kit Standard 25-Pack", "Assorted standard gaskets for general plumbing, 25 pieces.", 18.50, "pack", "Seals & Gaskets", ["gasket", "assorted", "plumbing"]),
  e("GK-HD-10", "Gasket Kit Heavy Duty 10-Pack", "Heavy duty gaskets for high-temp/high-pressure applications.", 28.00, "pack", "Seals & Gaskets", ["gasket", "heavy duty", "high temp", "high pressure"]),
  e("OR-KIT-200", "O-Ring Assortment Kit 200pc", "200-piece O-ring assortment in 18 popular sizes, nitrile rubber.", 14.00, "kit", "Seals & Gaskets", ["o-ring", "assortment", "nitrile", "rubber"]),
  e("OR-KIT-400", "O-Ring Assortment Kit 400pc", "400-piece O-ring assortment in 32 sizes, nitrile rubber.", 24.00, "kit", "Seals & Gaskets", ["o-ring", "assortment", "nitrile", "rubber", "large"]),
  e("PTFE-TAPE-12", "PTFE Thread Seal Tape 12-Roll", "Standard density PTFE tape, 1/2 inch x 260 inch, 12 rolls.", 8.50, "pack", "Seals & Gaskets", ["PTFE", "teflon", "thread seal", "tape"]),
  e("SR-VT-10", "Viton Seal Ring 10-Pack", "Fluoroelastomer seal rings for chemical and high-temp service.", 35.00, "pack", "Seals & Gaskets", ["viton", "fluoroelastomer", "high temp", "chemical resistant"]),
  e("MG-SHEET-1", "Gasket Sheet Material 12x12in", "Compressed non-asbestos gasket sheet, 1/16 inch thick.", 9.50, "sheet", "Seals & Gaskets", ["gasket sheet", "non-asbestos", "compressed fiber"]),

  // ── Pipe & Plumbing ──────────────────────────────────────────────────
  e("PE-90-300", "PVC Elbow 90° 300-Pack", '3/4" PVC 90-degree elbow fittings, 300 per case.', 0.45, "unit", "Pipe & Plumbing", ["PVC", "elbow", "90 degree", "3/4 inch"]),
  e("PE-45-100", "PVC Elbow 45° 100-Pack", '3/4" PVC 45-degree elbow fittings, 100 per case.', 0.55, "unit", "Pipe & Plumbing", ["PVC", "elbow", "45 degree", "3/4 inch"]),
  e("CT-HALF", 'Copper Tee 1/2" Fitting', "1/2-inch copper tee fitting for residential plumbing.", 2.10, "each", "Pipe & Plumbing", ["copper", "tee", "1/2 inch", "residential"]),
  e("CT-THREE-Q", 'Copper Tee 3/4" Fitting', "3/4-inch copper tee fitting for residential plumbing.", 3.25, "each", "Pipe & Plumbing", ["copper", "tee", "3/4 inch", "residential"]),
  e("PVC-P-10-1", 'PVC Pipe 1" Schedule 40 10ft', "1-inch schedule 40 PVC pipe, 10-foot length.", 4.50, "length", "Pipe & Plumbing", ["PVC", "pipe", "1 inch", "schedule 40"]),
  e("PVC-P-15-1", 'PVC Pipe 1.5" Schedule 40 10ft', "1.5-inch schedule 40 PVC pipe, 10-foot length.", 6.80, "length", "Pipe & Plumbing", ["PVC", "pipe", "1.5 inch", "schedule 40"]),
  e("PVC-P-20-2", 'PVC Pipe 2" Schedule 40 10ft', "2-inch schedule 40 PVC pipe, 10-foot length.", 9.20, "length", "Pipe & Plumbing", ["PVC", "pipe", "2 inch", "schedule 40"]),
  e("CP-HALF-10", 'Copper Pipe 1/2" Type L 10ft', "1/2-inch Type L copper pipe, 10-foot length, for potable water.", 22.00, "length", "Pipe & Plumbing", ["copper", "pipe", "1/2 inch", "Type L"]),
  e("CP-THREE-Q-10", 'Copper Pipe 3/4" Type L 10ft', "3/4-inch Type L copper pipe, 10-foot length, for potable water.", 32.00, "length", "Pipe & Plumbing", ["copper", "pipe", "3/4 inch", "Type L"]),
  e("PVC-U-2", 'PVC Union 2"', "2-inch PVC union for easy pipe disconnection.", 5.50, "each", "Pipe & Plumbing", ["PVC", "union", "2 inch"]),
  e("PVC-C-HALF", 'PVC Coupling 1/2"', "1/2-inch PVC slip coupling.", 0.35, "each", "Pipe & Plumbing", ["PVC", "coupling", "1/2 inch"]),
  e("PVC-C-THREE-Q", 'PVC Coupling 3/4"', "3/4-inch PVC slip coupling.", 0.45, "each", "Pipe & Plumbing", ["PVC", "coupling", "3/4 inch"]),

  // ── Hardware & Cabinet ────────────────────────────────────────────────
  e("BH-SM-500", "Brass Hinge Small - Bulk 500", "Small brass hinges for cabinet doors, bulk pack.", 0.85, "unit", "Hardware", ["brass", "hinge", "small", "cabinet"]),
  e("BH-MD-250", "Brass Hinge Medium 250-Pack", "Medium brass hinges for standard doors and cabinets.", 1.40, "unit", "Hardware", ["brass", "hinge", "medium", "cabinet"]),
  e("BH-LG-100", "Brass Hinge Large 100-Pack", "Large brass hinges for heavy doors and gates.", 2.50, "unit", "Hardware", ["brass", "hinge", "large", "gate"]),
  e("DS-18-PR", 'Drawer Slide 18" Pair', "18-inch full extension drawer slides, sold in pairs.", 11.00, "pair", "Hardware", ["drawer slide", "18 inch", "full extension"]),
  e("DS-22-PR", 'Drawer Slide 22" Pair', "22-inch full extension drawer slides, sold in pairs.", 13.50, "pair", "Hardware", ["drawer slide", "22 inch", "full extension"]),
  e("DS-24-PR", 'Drawer Slide 24" Pair', "24-inch full extension drawer slides, sold in pairs.", 15.00, "pair", "Hardware", ["drawer slide", "24 inch", "full extension"]),
  e("CK-RND", "Cabinet Knob Round - Brushed Nickel", "Round cabinet knob, brushed nickel finish.", 3.25, "each", "Hardware", ["cabinet", "knob", "round", "brushed nickel"]),
  e("CK-SQR", "Cabinet Knob Square - Matte Black", "Square cabinet knob, matte black finish.", 4.50, "each", "Hardware", ["cabinet", "knob", "square", "matte black"]),
  e("CK-BAR-4", 'Cabinet Bar Pull 4" Chrome', "4-inch cabinet bar pull, polished chrome finish.", 6.75, "each", "Hardware", ["cabinet", "bar pull", "4 inch", "chrome"]),
  e("CK-BAR-6", 'Cabinet Bar Pull 6" Chrome', "6-inch cabinet bar pull, polished chrome finish.", 8.25, "each", "Hardware", ["cabinet", "bar pull", "6 inch", "chrome"]),
  e("DH-SS-4", 'Door Hinge Stainless 4" Pair', "4-inch stainless steel door hinge, sold in pairs.", 12.00, "pair", "Hardware", ["door hinge", "stainless steel", "4 inch"]),
  e("DL-KW-STD", "Deadbolt Lock Kwikset Standard", "Standard deadbolt lock, Kwikset keyway, satin nickel.", 32.00, "each", "Hardware", ["deadbolt", "lock", "Kwikset", "satin nickel"]),

  // ── Automotive Parts ──────────────────────────────────────────────────
  e("OF-STD-10", "Oil Filter Standard 10-Pack", "Standard oil filter, fits most sedans. 10 per box.", 32.00, "pack", "Automotive", ["oil filter", "sedan", "standard"]),
  e("OF-PRM-5", "Oil Filter Premium 5-Pack", "Premium synthetic oil filter, extended life. 5 per box.", 28.00, "pack", "Automotive", ["oil filter", "premium", "synthetic"]),
  e("OF-HD-3", "Oil Filter Heavy Duty 3-Pack", "Heavy-duty oil filter for trucks and diesels. 3 per box.", 24.00, "pack", "Automotive", ["oil filter", "heavy duty", "truck", "diesel"]),
  e("BP-CRM-4", "Brake Pad Ceramic 4-Pack", "Ceramic brake pads, low dust. Set of 4.", 28.50, "set", "Automotive", ["brake pad", "ceramic", "low dust"]),
  e("BP-SEM-4", "Brake Pad Semi-Metallic 4-Pack", "Semi-metallic brake pads, all-weather performance. Set of 4.", 22.00, "set", "Automotive", ["brake pad", "semi-metallic", "all-weather"]),
  e("AF-STD-1", "Air Filter Standard Single", "Standard engine air filter, fits most 4-cylinder engines.", 12.00, "each", "Automotive", ["air filter", "engine", "standard"]),
  e("AF-PRM-1", "Air Filter Premium Single", "Premium high-flow engine air filter with extended life.", 18.50, "each", "Automotive", ["air filter", "engine", "premium", "high-flow"]),
  e("SP-IRD-4", "Spark Plug Iridium 4-Pack", "Iridium spark plugs, 100K mile rated. Set of 4.", 24.00, "set", "Automotive", ["spark plug", "iridium", "long life"]),
  e("SP-PLT-4", "Spark Plug Platinum 4-Pack", "Platinum spark plugs, 60K mile rated. Set of 4.", 18.00, "set", "Automotive", ["spark plug", "platinum"]),
  e("WB-STD-SET", "Wheel Bearing Standard Set", "Standard front wheel bearing and hub assembly.", 35.00, "set", "Automotive", ["wheel bearing", "hub", "front"]),
  e("TB-DRUM-PR", "Brake Drum Rear Pair", "Rear brake drums, cast iron, sold as pair.", 52.00, "pair", "Automotive", ["brake drum", "rear", "cast iron"]),
  e("WP-STD", "Water Pump Standard", "Engine water pump, fits most 4-cyl sedans.", 45.00, "each", "Automotive", ["water pump", "engine", "cooling"]),

  // ── Electrical & Wiring ───────────────────────────────────────────────
  e("EW-14-100", "Electrical Wire 14AWG 100ft", "THHN stranded copper wire, 14 AWG, 100-foot roll.", 28.00, "roll", "Electrical", ["wire", "14 AWG", "copper", "THHN"]),
  e("EW-12-100", "Electrical Wire 12AWG 100ft", "THHN stranded copper wire, 12 AWG, 100-foot roll.", 35.00, "roll", "Electrical", ["wire", "12 AWG", "copper", "THHN"]),
  e("EW-10-100", "Electrical Wire 10AWG 100ft", "THHN stranded copper wire, 10 AWG, 100-foot roll.", 45.00, "roll", "Electrical", ["wire", "10 AWG", "copper", "THHN"]),
  e("CB-20A-10", "Circuit Breaker 20A 10-Pack", "Single-pole 20A circuit breaker, plug-in type.", 42.00, "pack", "Electrical", ["circuit breaker", "20A", "single pole"]),
  e("CB-30A-10", "Circuit Breaker 30A 10-Pack", "Single-pole 30A circuit breaker, plug-in type.", 52.00, "pack", "Electrical", ["circuit breaker", "30A", "single pole"]),
  e("JB-STD", "Junction Box Standard", "Standard 4x4 electrical junction box, steel.", 4.50, "each", "Electrical", ["junction box", "steel", "4x4"]),
  e("JB-WP", "Junction Box Weatherproof", "Weatherproof junction box with gasket seal, PVC.", 8.75, "each", "Electrical", ["junction box", "weatherproof", "PVC", "outdoor"]),
  e("CT-100", "Cable Ties 100-Pack", "Standard nylon cable ties, 8 inch, 50lb tensile.", 3.20, "pack", "Electrical", ["cable ties", "nylon", "8 inch"]),
  e("CT-500", "Cable Ties 500-Pack", "Standard nylon cable ties, 8 inch, 50lb tensile, bulk.", 12.00, "pack", "Electrical", ["cable ties", "nylon", "8 inch", "bulk"]),
  e("EC-STD-50", "Electrical Connector Kit 50pc", "Assorted wire connectors: wire nuts, butt splices, ring terminals.", 15.00, "kit", "Electrical", ["connector", "wire nut", "terminal", "assorted"]),
  e("GFCI-15A", "GFCI Outlet 15A", "Ground-fault circuit interrupter outlet, 15A, tamper-resistant.", 14.50, "each", "Electrical", ["GFCI", "outlet", "15A", "tamper resistant"]),
  e("LED-TUBE-4", "LED Tube Light 4ft T8", "4-foot T8 LED tube, 18W, 4000K neutral white, ballast bypass.", 8.00, "each", "Electrical", ["LED", "tube light", "T8", "4 foot", "4000K"]),

  // ── Pumps & Impellers ─────────────────────────────────────────────────
  e("PI-CEN-4", 'Centrifugal Pump Impeller 4"', "4-inch cast iron centrifugal pump impeller, closed type.", 85.00, "unit", "Pumps", ["impeller", "centrifugal", "4 inch", "cast iron"]),
  e("PI-CEN-6", 'Centrifugal Pump Impeller 6"', "6-inch cast iron centrifugal pump impeller, closed type.", 125.00, "unit", "Pumps", ["impeller", "centrifugal", "6 inch", "cast iron"]),
  e("PI-CEN-8", 'Centrifugal Pump Impeller 8"', "8-inch cast iron centrifugal pump impeller, closed type.", 175.00, "unit", "Pumps", ["impeller", "centrifugal", "8 inch", "cast iron"]),
  e("PI-SUB-3", 'Submersible Pump Impeller 3"', "3-inch stainless steel submersible pump impeller.", 65.00, "unit", "Pumps", ["impeller", "submersible", "3 inch", "stainless steel"]),
  e("PI-SUB-4", 'Submersible Pump Impeller 4"', "4-inch stainless steel submersible pump impeller.", 90.00, "unit", "Pumps", ["impeller", "submersible", "4 inch", "stainless steel"]),
  e("PM-CEN-2HP", "Centrifugal Pump Motor 2HP", "2HP electric motor for centrifugal pumps, TEFC, 3450 RPM.", 450.00, "unit", "Pumps", ["pump motor", "2HP", "TEFC", "centrifugal"]),
  e("PM-CEN-5HP", "Centrifugal Pump Motor 5HP", "5HP electric motor for centrifugal pumps, TEFC, 3450 RPM.", 780.00, "unit", "Pumps", ["pump motor", "5HP", "TEFC", "centrifugal"]),
  e("PS-KIT-STD", "Pump Seal Kit Standard", "Standard mechanical seal kit for centrifugal pumps.", 28.00, "kit", "Pumps", ["pump seal", "mechanical seal", "kit"]),

  // ── Sprockets & Gears ─────────────────────────────────────────────────
  e("SPR-100", "Sprocket Standard (Silver)", "Standard sprocket, silver finish. 25 units per box.", 38.00, "box", "Power Transmission", ["sprocket", "silver", "standard"]),
  e("SPR-GRN-200", "Green Sprocket Premium", "Premium sprocket with green coating. 20 units per box.", 52.00, "box", "Power Transmission", ["sprocket", "green", "premium", "coated"]),
  e("SPR-BLU-300", "Blue Sprocket Heavy Duty", "Heavy-duty sprocket with blue coating. 15 units per box.", 68.00, "box", "Power Transmission", ["sprocket", "blue", "heavy duty", "coated"]),
  e("GR-STL-20T", "Steel Gear 20-Tooth", "20-tooth steel spur gear, 14.5° pressure angle, 1/2\" bore.", 15.00, "each", "Power Transmission", ["gear", "steel", "20 tooth", "spur"]),
  e("GR-STL-40T", "Steel Gear 40-Tooth", "40-tooth steel spur gear, 14.5° pressure angle, 3/4\" bore.", 28.00, "each", "Power Transmission", ["gear", "steel", "40 tooth", "spur"]),
  e("GR-BRZ-20T", "Bronze Gear 20-Tooth", "20-tooth bronze spur gear, quiet operation, 1/2\" bore.", 22.00, "each", "Power Transmission", ["gear", "bronze", "20 tooth", "spur", "quiet"]),
  e("CH-40-10", "Roller Chain #40 10ft", "#40 single strand roller chain, 1/2 inch pitch, 10-foot length.", 18.00, "length", "Power Transmission", ["roller chain", "#40", "1/2 inch"]),
  e("CH-60-10", "Roller Chain #60 10ft", "#60 single strand roller chain, 3/4 inch pitch, 10-foot length.", 32.00, "length", "Power Transmission", ["roller chain", "#60", "3/4 inch"]),

  // ── Adhesives & Chemicals ─────────────────────────────────────────────
  e("ADH-EP-8", "Epoxy Adhesive 8oz", "Two-part industrial epoxy, 5-minute set time, 3500 PSI bond.", 12.50, "tube", "Chemicals", ["epoxy", "adhesive", "two-part", "fast set"]),
  e("ADH-EP-32", "Epoxy Adhesive 32oz", "Two-part industrial epoxy, 5-minute set time, 3500 PSI bond, bulk.", 38.00, "bottle", "Chemicals", ["epoxy", "adhesive", "two-part", "bulk"]),
  e("LUB-ML-16", "Machine Lubricant 16oz", "Multi-purpose machine lubricant, anti-wear formula.", 9.50, "bottle", "Chemicals", ["lubricant", "machine", "anti-wear"]),
  e("LUB-ML-128", "Machine Lubricant 1 Gallon", "Multi-purpose machine lubricant, anti-wear formula, bulk.", 32.00, "gallon", "Chemicals", ["lubricant", "machine", "anti-wear", "bulk"]),
  e("CL-DGR-32", "Degreaser Concentrate 32oz", "Industrial degreaser concentrate, dilutes 10:1.", 14.00, "bottle", "Chemicals", ["degreaser", "concentrate", "industrial"]),
  e("TL-ANTI-16", "Anti-Seize Compound 16oz", "Nickel-based anti-seize compound for high-temp fasteners.", 18.00, "can", "Chemicals", ["anti-seize", "nickel", "high temp", "compound"]),

  // ── Safety & PPE ──────────────────────────────────────────────────────
  e("SG-CLR-12", "Safety Glasses Clear 12-Pack", "ANSI Z87.1 clear safety glasses with anti-scratch coating.", 24.00, "pack", "Safety", ["safety glasses", "clear", "ANSI", "anti-scratch"]),
  e("SG-TNT-12", "Safety Glasses Tinted 12-Pack", "ANSI Z87.1 tinted safety glasses, UV protection.", 28.00, "pack", "Safety", ["safety glasses", "tinted", "ANSI", "UV"]),
  e("WG-NIT-100", "Work Gloves Nitrile 100-Pack", "Disposable nitrile work gloves, powder-free, large.", 18.00, "box", "Safety", ["gloves", "nitrile", "disposable", "powder-free"]),
  e("WG-LTH-12", "Work Gloves Leather 12-Pack", "Premium cowhide leather work gloves, reinforced palm.", 45.00, "pack", "Safety", ["gloves", "leather", "cowhide", "reinforced"]),
  e("EP-FOM-50", "Ear Plugs Foam 50-Pair", "Disposable foam ear plugs, NRR 32dB, individually wrapped.", 8.50, "pack", "Safety", ["ear plugs", "foam", "NRR 32", "hearing protection"]),
  e("HR-STD", "Hard Hat Standard White", "ANSI Type I Class E hard hat, ratchet suspension, white.", 15.00, "each", "Safety", ["hard hat", "ANSI", "Type I", "white"]),
  e("HV-VEST-L", "Hi-Vis Safety Vest Large", "ANSI Class 2 high-visibility safety vest, mesh, large.", 9.00, "each", "Safety", ["hi-vis", "safety vest", "ANSI Class 2", "mesh"]),

  // ── Widgets & Gadgets (misc) ──────────────────────────────────────────
  e("WDG-BLU-10", "Blue Widget 10-Pack", "Premium blue widgets, 10 units per case. Industrial grade.", 24.99, "case", "General", ["widget", "blue", "industrial"]),
  e("WDG-RED-10", "Red Widget 10-Pack", "Premium red widgets, 10 units per case. Industrial grade.", 24.99, "case", "General", ["widget", "red", "industrial"]),
  e("WDG-GRN-10", "Green Widget 10-Pack", "Premium green widgets, 10 units per case. Industrial grade.", 24.99, "case", "General", ["widget", "green", "industrial"]),
  e("GDG-RED-01", "Red Gadget Standard", "Standard red gadget, individual unit. Consumer grade.", 12.50, "each", "General", ["gadget", "red", "consumer"]),
  e("GDG-BLU-01", "Blue Gadget Standard", "Standard blue gadget, individual unit. Consumer grade.", 12.50, "each", "General", ["gadget", "blue", "consumer"]),
  e("GDG-GRN-01", "Green Gadget Premium", "Premium green gadget, individual unit. Industrial grade.", 18.00, "each", "General", ["gadget", "green", "premium", "industrial"]),

  // ── Additional Stock ──────────────────────────────────────────────────
  e("TB-51107", "Thrust Bearing 51107", "Single direction thrust ball bearing, 35x52x12mm.", 11.50, "each", "Bearings", ["thrust bearing", "axial", "51107"]),
  e("SF-6-150", 'SS Flange 6" 150lb', "6-inch stainless steel flange, 150 lb pressure class.", 42.00, "each", "Flanges", ["stainless steel", "flange", "6-inch", "150lb"]),
  e("SF-6-300", 'SS Flange 6" 300lb', "6-inch stainless steel flange, 300 lb pressure class.", 72.00, "each", "Flanges", ["stainless steel", "flange", "6-inch", "300lb"]),
  e("HB-M20-80", "Hex Bolt M20x80mm 10-Pack", "Grade 10.9 hex bolt, M20 thread, 80mm length. 10 per pack.", 14.80, "pack", "Fasteners", ["hex bolt", "M20", "grade 10.9", "80mm"]),
  e("BV-3-SS", 'Ball Valve 3" Stainless', "3-inch stainless steel ball valve, full port, 1000 WOG.", 85.00, "unit", "Valves", ["ball valve", "stainless steel", "3-inch", "full port"]),
  e("PI-CEN-10", 'Centrifugal Pump Impeller 10"', "10-inch cast iron centrifugal pump impeller, closed type.", 240.00, "unit", "Pumps", ["impeller", "centrifugal", "10 inch", "cast iron"]),
  e("EW-8-100", "Electrical Wire 8AWG 100ft", "THHN stranded copper wire, 8 AWG, 100-foot roll.", 58.00, "roll", "Electrical", ["wire", "8 AWG", "copper", "THHN"]),
  e("DS-16-PR", 'Drawer Slide 16" Pair', "16-inch full extension drawer slides, sold in pairs.", 9.50, "pair", "Hardware", ["drawer slide", "16 inch", "full extension"]),
  e("BP-ORG-4", "Brake Pad Organic 4-Pack", "Organic brake pads, quiet operation. Set of 4.", 18.00, "set", "Automotive", ["brake pad", "organic", "quiet"]),
  e("CH-80-10", "Roller Chain #80 10ft", "#80 single strand roller chain, 1 inch pitch, 10-foot length.", 48.00, "length", "Power Transmission", ["roller chain", "#80", "1 inch"]),
  e("ADH-CA-1", "Cyanoacrylate Adhesive 1oz", "Industrial cyanoacrylate (super glue), fast bond, 1 oz tube.", 6.50, "tube", "Chemicals", ["cyanoacrylate", "super glue", "fast bond", "adhesive"]),
  e("FR-EXTING-5", "Fire Extinguisher 5lb ABC", "5-pound ABC dry chemical fire extinguisher, wall-mountable.", 42.00, "each", "Safety", ["fire extinguisher", "ABC", "5 lb", "dry chemical"]),
];
