import { skuCatalog } from "@/lib/sku-catalog";
import type { SkuCatalogEntry } from "@/lib/sku-catalog";
import type { LucideIcon } from "lucide-react";
import {
  User,
  Phone,
  MapPin,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Tag,
  Truck,
  DollarSign,
  Headphones,
  Clock,
  ShieldCheck,
  Package,
  Mail,
  Target,
  Wrench,
  Gauge,
  Droplets,
  Zap,
  Settings,
  Hammer,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

const FEATURED_SKUS = ["BB-6205", "VA-200", "HB-M10-40", "PI-CEN-6"];

const NAV_ITEMS = [
  "All Products",
  "Bearings",
  "Fasteners",
  "Valves",
  "Pipe & Plumbing",
  "Electrical",
  "Safety",
  "Pumps",
  "Hardware",
];

const CATEGORIES: { name: string; icon: LucideIcon; catalogKey: string; image: string }[] = [
  { name: "Bearings", icon: Target, catalogKey: "Bearings", image: "/products/cat-bearings.jpg" },
  { name: "Fasteners", icon: Wrench, catalogKey: "Fasteners", image: "/products/cat-fasteners.jpg" },
  { name: "Valves", icon: Gauge, catalogKey: "Valves", image: "/products/cat-valves.jpg" },
  { name: "Pipe & Plumbing", icon: Droplets, catalogKey: "Pipe & Plumbing", image: "/products/cat-plumbing.jpg" },
  { name: "Electrical", icon: Zap, catalogKey: "Electrical", image: "/products/cat-electrical.jpg" },
  { name: "Safety & PPE", icon: ShieldCheck, catalogKey: "Safety", image: "/products/cat-safety.jpg" },
  { name: "Pumps & Impellers", icon: Settings, catalogKey: "Pumps", image: "/products/cat-pumps.jpg" },
  { name: "Hardware", icon: Hammer, catalogKey: "Hardware", image: "/products/cat-hardware.jpg" },
];

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  Bearings: "/products/bearing.jpg",
  Flanges: "/products/pipe-fittings.jpg",
  Fasteners: "/products/bolts-fasteners.jpg",
  Valves: "/products/valve-brass.jpg",
  "Seals & Gaskets": "/products/pipe-fittings.jpg",
  "Pipe & Plumbing": "/products/pipe-fittings.jpg",
  Hardware: "/products/hinge-hardware.jpg",
  Automotive: "/products/bearing.jpg",
  Electrical: "/products/wire-electrical.jpg",
  Pumps: "/products/pump-impeller.jpg",
  "Power Transmission": "/products/pump-impeller.jpg",
  Chemicals: "/products/bolts-fasteners.jpg",
  Safety: "/products/hard-hat.jpg",
  General: "/products/bolts-fasteners.jpg",
};

function ProductCard({ product }: { product: SkuCatalogEntry }) {
  const imageSrc = PRODUCT_IMAGE_MAP[product.category] || "/products/bolts-fasteners.jpg";
  return (
    <div className="bg-white rounded-lg border border-[#E9ECEF] overflow-hidden hover:shadow-lg transition-all group">
      <div className="h-48 relative border-b border-[#E9ECEF] overflow-hidden bg-[#F8F9FA]">
        <img
          src={imageSrc}
          alt={product.catalogName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-[#28A745] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          In Stock
        </span>
      </div>
      <div className="p-4">
        <p className="text-[11px] text-[#6C757D] mb-1 font-mono tracking-wide">
          SKU: {product.catalogSku}
        </p>
        <h3 className="font-semibold text-[#212529] text-sm leading-snug mb-1.5 line-clamp-2 min-h-[2.5rem]">
          {product.catalogName}
        </h3>
        <p className="text-xs text-[#6C757D] mb-3 line-clamp-2">
          {product.catalogDescription}
        </p>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-xl font-bold text-[#212529]">
            ${product.catalogPrice.toFixed(2)}
          </span>
          <span className="text-xs text-[#6C757D]">
            / {product.catalogUom}
          </span>
        </div>
        <button className="w-full bg-[#E63312] hover:bg-[#CC2200] text-white text-sm font-semibold py-2.5 rounded-md transition-colors cursor-pointer">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  const featuredProducts = FEATURED_SKUS.map((sku) =>
    skuCatalog.find((p) => p.catalogSku === sku)
  ).filter((p): p is SkuCatalogEntry => p !== undefined);

  const categoryCounts: Record<string, number> = {};
  skuCatalog.forEach((item) => {
    categoryCounts[item.category] =
      (categoryCounts[item.category] || 0) + 1;
  });

  return (
    <>
      {/* ── Utility Bar ─────────────────────────────────────── */}
      <div className="bg-[#001a33] text-white/90 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>1-800-555-2739</span>
            </a>
            <span className="text-white/30">|</span>
            <span className="hidden sm:inline">
              Free Shipping on Orders Over $99
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" className="hover:text-white transition-colors">
              Help Center
            </a>
            <span className="text-white/30">|</span>
            <a href="#" className="hover:text-white transition-colors">
              Track Order
            </a>
            <span className="text-white/30 hidden sm:inline">|</span>
            <a
              href="#"
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <MapPin className="w-3 h-3" />
              Find a Branch
            </a>
            <span className="text-white/30">|</span>
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-white font-medium transition-colors"
            >
              <User className="w-3 h-3" />
              Sign In / Register
            </a>
          </div>
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <StorefrontHeader />

      {/* ── Category Navigation ─────────────────────────────── */}
      <nav className="bg-[#003366] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item}
              href="#"
              className={`px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white font-medium transition-colors whitespace-nowrap ${i === 0 ? "bg-white/10 text-white" : ""}`}
            >
              {item}
            </a>
          ))}
          <a
            href="#"
            className="px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white font-medium flex items-center gap-1 whitespace-nowrap transition-colors"
          >
            More <ChevronDown className="w-3 h-3" />
          </a>
        </div>
      </nav>

      {/* ── Promo Banner ────────────────────────────────────── */}
      <div className="bg-[#E63312] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-10 gap-2">
          <Tag className="w-4 h-4 flex-shrink-0" />
          <span>
            New customers save <strong>10%</strong> on first order — Use
            code <strong>APEX10</strong> at checkout
          </span>
          <a
            href="#"
            className="ml-2 underline underline-offset-2 font-medium hover:no-underline flex items-center gap-1 whitespace-nowrap"
          >
            Shop Now <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      <main>
        {/* ── Hero Banner ─────────────────────────────────── */}
        <section
          className="relative py-20 md:py-28 overflow-hidden"
          style={{
            background: `
              repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 80px),
              linear-gradient(135deg, #001a33 0%, #003366 50%, #004080 100%)
            `,
          }}
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/[0.03] rounded-full translate-y-1/3" />
          <div className="absolute top-1/2 right-12 w-48 h-48 bg-white/[0.02] rounded-full -translate-y-1/2 hidden lg:block" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-2xl">
              <p className="text-[#7EB0E0] text-sm font-semibold uppercase tracking-wider mb-4">
                Trusted by 2,000+ businesses
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
                Your Trusted Source for Industrial Parts &amp; Equipment
              </h1>
              <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed">
                From bearings and fasteners to valves and pumps — over 150
                products in stock and ready to ship. Same-day shipping on
                orders placed before 2 PM CT.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#E63312] hover:bg-[#CC2200] text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-colors"
                >
                  Shop All Products
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-colors"
                >
                  Request a Quote
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Shop by Category ────────────────────────────── */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#212529]">
                Shop by Category
              </h2>
              <a
                href="#"
                className="text-sm text-[#003366] hover:text-[#E63312] font-medium flex items-center gap-1 transition-colors"
              >
                View All Categories
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = categoryCounts[cat.catalogKey] || 0;
                return (
                  <a
                    key={cat.name}
                    href="#"
                    className="group bg-white border border-[#E9ECEF] rounded-lg hover:shadow-lg hover:border-[#003366]/20 transition-all overflow-hidden"
                  >
                    <div className="h-32 overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EDF2F7] flex items-center justify-center flex-shrink-0 group-hover:bg-[#003366]/10 transition-colors">
                        <Icon className="w-4.5 h-4.5 text-[#003366]" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-[#212529] block">
                          {cat.name}
                        </span>
                        <span className="text-xs text-[#6C757D]">
                          {count} products
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Featured Products ────────────────────────────── */}
        <section className="py-14 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#212529]">
                Featured Products
              </h2>
              <a
                href="#"
                className="text-sm text-[#003366] hover:text-[#E63312] font-medium flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.catalogSku}
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Value Propositions ───────────────────────────── */}
        <section className="py-12 bg-white border-y border-[#E9ECEF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  icon: Truck,
                  title: "Free Shipping",
                  desc: "On all orders over $99",
                },
                {
                  icon: DollarSign,
                  title: "Bulk Pricing",
                  desc: "Volume discounts available",
                },
                {
                  icon: Headphones,
                  title: "Technical Support",
                  desc: "Expert help when you need it",
                },
                {
                  icon: Clock,
                  title: "Same-Day Shipping",
                  desc: "Order by 2 PM CT",
                },
              ].map((prop) => {
                const Icon = prop.icon;
                return (
                  <div
                    key={prop.title}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#003366]/10 flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-[#003366]" />
                    </div>
                    <span className="font-semibold text-sm text-[#212529]">
                      {prop.title}
                    </span>
                    <span className="text-xs text-[#6C757D] mt-0.5">
                      {prop.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Trust / Why Choose Apex ──────────────────────── */}
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-[#212529] mb-2">
              Why Businesses Choose Apex Industrial
            </h2>
            <p className="text-[#6C757D] mb-10 max-w-xl mx-auto">
              Trusted by manufacturers, contractors, and facilities teams
              nationwide for reliable supply and expert service.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                { value: "15+", label: "Years in Business" },
                { value: "150+", label: "Products Available" },
                { value: "98%", label: "Same-Day Ship Rate" },
                { value: "2,000+", label: "Active Accounts" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-bold text-[#003366] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#6C757D]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                "ISO 9001:2015",
                "ANSI Certified",
                "RoHS Compliant",
                "DFARS Compliant",
              ].map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 bg-white border border-[#DEE2E6] rounded-full px-5 py-2.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#28A745]" />
                  <span className="text-sm font-medium text-[#495057]">
                    {cert}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-[#001a33] text-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
                Products
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Bearings",
                  "Fasteners",
                  "Valves",
                  "Pipe & Plumbing",
                  "Electrical",
                  "Safety & PPE",
                  "Pumps",
                  "Hardware",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
                Customer Service
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Contact Us",
                  "Track Order",
                  "Returns & Exchanges",
                  "Shipping Info",
                  "FAQ",
                  "Bulk Orders",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
                Company
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  "About Apex",
                  "Careers",
                  "Blog",
                  "Certifications",
                  "Partners",
                  "Press",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
                Contact Us
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/60" />
                  <span>1-800-555-2739</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/60" />
                  <span>sales@apexindustrial.com</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/60" />
                  <div>
                    1200 Commerce Pkwy
                    <br />
                    Houston, TX 77001
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/60" />
                  <div>
                    Mon–Fri 7AM–6PM CT
                    <br />
                    Sat 8AM–1PM CT
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
            <span>
              © 2026 Apex Industrial Supply Co. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:text-white/80 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-white/80 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-white/80 transition-colors"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
