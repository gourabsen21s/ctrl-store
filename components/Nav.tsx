"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Mark from "@/components/Mark";
import { useBag } from "@/components/providers/BagProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { MenuPanel, MenuToggle } from "@/components/Menu";

/**
 * mix-blend-difference means the nav inverts against whatever scrolls beneath
 * it, so one set of colours reads correctly on cream, black and red alike.
 * It sits above the menu panel so the toggle stays clickable while open.
 */
export default function Nav() {
  const pathname = usePathname();
  const { count } = useBag();
  const { count: wishlistCount, openDrawer: openWishlist } = useWishlist();
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
        <div className="flex w-full items-center justify-between px-4 py-9 lg:px-6">
          <Link
            href="/"
            data-cursor
            aria-label="Home"
            className="mr-2 lg:mr-6"
            onClick={() => setMenuOpen(false)}
          >
            <Mark className="h-[1.1rem] w-[2.2rem]" />
          </Link>

          <div className="flex items-center gap-3 md:gap-16">
            <ul className="hidden items-center gap-8 text-lg tracking-tight md:flex md:gap-16 md:text-2xl">
              <li>
                <Link href="/" data-cursor className="underline underline-offset-[6px]">
                  Shop
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  data-cursor
                  onClick={openWishlist}
                  className="transition-opacity hover:opacity-70"
                >
                  Wishlist ({wishlistCount})
                </button>
              </li>
              <li>
                <Link href="/bag" data-cursor>
                  Bag ({count})
                </Link>
              </li>
            </ul>

            <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />

            {/* Reserves the space the fixed theme switcher sits in. */}
            <div className="hidden h-[1.265625rem] w-[3.875rem] md:block" aria-hidden />
          </div>
        </div>
      </nav>

      <MenuPanel open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </>
  );
}
