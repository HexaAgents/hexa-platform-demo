"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { suppliers } from "@/lib/mockData";
import { useState } from "react";

const mainNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Claims Queue", href: "/claims", icon: FileText },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  { label: "Settings", href: "/policy", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [suppliersOpen, setSuppliersOpen] = useState(false);

  const isSuppliersActive = pathname.startsWith("/suppliers");

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-14">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e86b47]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" fill="white" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-foreground">Hexa</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-1">
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const isSupplierNav = item.href === "/suppliers";
            const active = isSupplierNav
              ? isSuppliersActive
              : item.href === "/"
                ? pathname === "/"
                : item.href !== "#" && pathname.startsWith(item.href);
            return (
              <div key={item.href + item.label}>
                <Link
                  href={isSupplierNav ? "#" : item.href}
                  onClick={isSupplierNav ? (e) => { e.preventDefault(); setSuppliersOpen(!suppliersOpen); } : undefined}
                  className={cn(
                    "flex items-center gap-3 px-5 py-[7px] text-[13.5px]",
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-[17px] w-[17px]", active ? "text-foreground" : "text-muted-foreground/70")} />
                  {item.label}
                  {isSupplierNav && (
                    suppliersOpen ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />
                  )}
                </Link>
                {isSupplierNav && suppliersOpen && (
                  <div className="space-y-0.5 mt-0.5">
                    {suppliers.map((s) => {
                      const href = `/suppliers/${s.id}`;
                      const subActive = pathname === href;
                      return (
                        <Link
                          key={s.id}
                          href={href}
                          className={cn(
                            "flex items-center pl-12 pr-5 py-[5px] text-[13px]",
                            subActive
                              ? "text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {s.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-[#e86b47]/10 flex items-center justify-center text-[11px] font-medium text-[#e86b47]">
            SC
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-medium text-foreground truncate">Sarah Chen</p>
            <p className="text-[11px] text-muted-foreground truncate">Procurement</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
