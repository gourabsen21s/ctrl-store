"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Mark from "@/components/Mark";
import { useBag } from "@/components/providers/BagProvider";
import { MenuPanel } from "@/components/Menu";

/**
 * mix-blend-difference means the nav inverts against whatever scrolls beneath
 * it, so one set of colours reads correctly on cream, black and red alike.
 * It sits above the menu panel so the toggle stays clickable while open.
 */
export default function Nav() {
  const pathname = usePathname();
  const { count, openDrawer: openBag } = useBag();
  const [menuOpen, setMenuOpen] = useState(false);

  // Do not render storefront navigation on admin dashboard or admin login
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <nav
        id="header"
        className="fixed top-0 left-0 z-[50] flex w-full items-center justify-between text-white mix-blend-difference"
      >
        <div className="mx-auto flex w-full items-center justify-between px-4 py-8 lg:px-6">
          <Link
            href="/"
            data-cursor
            aria-label="Home"
            className="mr-2 lg:mr-6"
            onClick={() => setMenuOpen(false)}
          >
            <Mark className="h-[1.5em] w-[3.375em]" />
          </Link>

          <div className="flex items-center gap-3 md:gap-16">
            <ul className="text-md flex items-center gap-6 tracking-tight md:gap-14 md:text-2xl">
              <li className="hidden md:block">
                <Link
                  href="/"
                  data-cursor
                  className={`transition-opacity hover:opacity-70 ${
                    pathname === "/" ? "underline underline-offset-[6px]" : ""
                  }`}
                >
                  Home
                </Link>
              </li>
              <li className="hidden md:block">
                <Link
                  href="/store"
                  data-cursor
                  className={`transition-opacity hover:opacity-70 ${
                    pathname === "/store" || pathname?.startsWith("/store")
                      ? "underline underline-offset-[6px]"
                      : ""
                  }`}
                >
                  Store
                </Link>
              </li>
              <li className="hidden md:block">
                <Link
                  href="/account"
                  data-cursor
                  className={`transition-opacity hover:opacity-70 ${
                    pathname?.startsWith("/account")
                      ? "underline underline-offset-[6px]"
                      : ""
                  }`}
                >
                  Account
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  data-cursor
                  onClick={openBag}
                  className="transition-opacity hover:opacity-70"
                >
                  Bag <span>({count})</span>
                </button>
              </li>
              <li className="md:hidden">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="min-w-[2.625rem] uppercase tracking-wider text-sm font-bold"
                >
                  {menuOpen ? "Close" : "Menu"}
                </button>
              </li>
            </ul>

            {/* Reserves the space the fixed theme switcher sits in. */}
            <div className="hidden h-[1.265625rem] w-[3.875rem] md:block" aria-hidden />
          </div>
        </div>
      </nav>

      <MenuPanel open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </>
  );
}
