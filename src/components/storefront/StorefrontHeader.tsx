"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Package, Upload } from "lucide-react";
import UploadOrderModal from "./UploadOrderModal";

export default function StorefrontHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-[#DEE2E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 lg:gap-8 h-[72px]">
          <a href="/storefront" className="flex-shrink-0">
            <div className="flex flex-col leading-none">
              <span className="text-[26px] font-extrabold text-[#003366] tracking-tight">
                APEX
              </span>
              <span className="text-[9px] font-semibold text-[#6C757D] tracking-[0.22em] uppercase -mt-0.5">
                Industrial Supply
              </span>
            </div>
          </a>

          <div className="flex-1 flex">
            <div className="flex w-full max-w-2xl mx-auto">
              <select className="bg-[#F8F9FA] border border-r-0 border-[#CED4DA] rounded-l-lg px-3 py-2.5 text-sm text-[#495057] focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236C757D%22%20stroke-width%3D%222.5%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat pr-8">
                <option>All Categories</option>
                <option>Bearings</option>
                <option>Fasteners</option>
                <option>Valves</option>
                <option>Electrical</option>
                <option>Safety</option>
                <option>Pumps</option>
              </select>
              <input
                type="text"
                placeholder="Search parts, SKUs, or brands..."
                className="flex-1 border border-[#CED4DA] px-4 py-2.5 text-sm focus:outline-none focus:border-[#003366] min-w-0"
              />
              <button className="bg-[#E63312] hover:bg-[#CC2200] text-white px-5 rounded-r-lg transition-colors cursor-pointer">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Order
            </button>
            <a
              href="#"
              className="hidden lg:flex text-sm text-[#003366] hover:text-[#E63312] font-medium items-center gap-1.5 transition-colors"
            >
              <Package className="w-4 h-4" />
              Quick Order
            </a>
            <a
              href="/storefront/cart"
              className="relative text-[#003366] hover:text-[#E63312] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-[#E63312] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </a>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {modalOpen && (
          <UploadOrderModal onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
