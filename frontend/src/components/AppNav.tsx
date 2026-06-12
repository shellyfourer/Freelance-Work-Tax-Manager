"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/clients", label: "Client Management" },
  { href: "/income", label: "Income Tracking" },
  { href: "/calculator", label: "Tax Calculator" },
];

export function AppNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

return (
    <header className="sticky top-0 z-50 bg-sidebar border-b border-sidebar-border">
      <div className="flex items-center justify-between w-full max-w-300 mx-auto px-4 md:px-8 h-14">
        {/* User */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
          <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-sidebar-primary border-[1.5px] border-sidebar-border">
            <span className="text-caption text-sidebar-primary-foreground leading-none">DU</span>
          </div>
          <span className="text-caption text-sidebar-foreground">Default User</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-block py-1.5 px-4 rounded-button border-[1.5px] whitespace-nowrap no-underline text-caption transition-all duration-150",
                  isActive
                    ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                    : "border-transparent bg-transparent text-sidebar-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 cursor-pointer text-sidebar-foreground"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sidebar-border bg-sidebar px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2 px-4 rounded-button border whitespace-nowrap no-underline text-caption transition-all duration-150",
                  isActive
                    ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                    : "border-transparent bg-transparent text-sidebar-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
