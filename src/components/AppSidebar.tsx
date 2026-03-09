"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneCall,
  ShoppingCart,
  FileText,
  PackageSearch,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import HexaLogo from "@/components/shared/HexaLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { slaSuppliers } from "@/data/sla-data";

const navItems = [
  { name: "Call Tracker", icon: PhoneCall, href: "/calls" },
  { name: "Orders", icon: ShoppingCart, href: "/orders" },
  { name: "Procurement", icon: PackageSearch, href: "/procurement" },
  { name: "Claims", icon: FileText, href: "/claims" },
  { name: "Suppliers", icon: Truck, href: "/suppliers", expandable: true },
  { name: "Settings", icon: Settings, href: "/settings" },
];

interface AppSidebarProps {
  activeItem?: string;
}

export default function AppSidebar({ activeItem }: AppSidebarProps) {
  const pathname = usePathname();
  const [suppliersOpen, setSuppliersOpen] = useState(pathname.startsWith("/suppliers"));

  const isActive = (item: typeof navItems[number]) => {
    if (activeItem) return item.name === activeItem;
    if (item.href === "#") return false;
    if (item.href === "/orders") return pathname === "/" || pathname.startsWith("/orders");
    if (item.href === "/calls") return pathname.startsWith("/calls") || pathname.startsWith("/demo");
    if (item.href === "/procurement") return pathname.startsWith("/procurement");
    if (item.href === "/claims") return pathname.startsWith("/claims");
    if (item.href === "/suppliers") return pathname.startsWith("/suppliers");
    if (item.href === "/settings") return pathname.startsWith("/settings");
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="flex h-full w-[248px] flex-shrink-0 flex-col border-r border-border bg-background/70">
      <div className="px-4 pb-6 pt-5">
        <HexaLogo size={24} showText textClassName="text-base text-foreground" />
      </div>

      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const isDisabled = item.href === "#";
          const isExpandable = "expandable" in item && item.expandable;

          return (
            <div key={item.name}>
              {isExpandable ? (
                <button
                  onClick={() => setSuppliersOpen(!suppliersOpen)}
                  className={cn(
                    "relative flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-r bg-primary" />
                  )}
                  <item.icon size={15} strokeWidth={active ? 2 : 1.7} />
                  <span>{item.name}</span>
                  {suppliersOpen ? (
                    <ChevronDown className="ml-auto h-3 w-3" />
                  ) : (
                    <ChevronRight className="ml-auto h-3 w-3" />
                  )}
                </button>
              ) : (
                (() => {
                  const Wrapper = isDisabled ? "div" : Link;
                  return (
                    <Wrapper
                      href={isDisabled ? undefined! : item.href}
                      className={cn(
                        "relative flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                        isDisabled && "cursor-default opacity-50"
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-r bg-primary" />
                      )}
                      <item.icon size={15} strokeWidth={active ? 2 : 1.7} />
                      <span>{item.name}</span>
                    </Wrapper>
                  );
                })()
              )}

              {isExpandable && suppliersOpen && (
                <div className="space-y-0.5 mt-0.5">
                  {slaSuppliers.map((s) => {
                    const href = `/suppliers/${s.id}`;
                    const subActive = pathname === href;
                    return (
                      <Link
                        key={s.id}
                        href={href}
                        className={cn(
                          "flex items-center pl-10 pr-3 py-1.5 text-[13px] transition-colors",
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
      </nav>

      <div className="mx-3 mb-3 flex items-center gap-3 border border-border bg-card p-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            JM
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">James Morrison</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">Sales Manager</p>
        </div>
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
      </div>
    </aside>
  );
}
