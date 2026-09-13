import Link from "next/link";
import { BRAND, TAGLINE_A, TAGLINE_B, YEAR_MARK, BLURB } from "@/lib/site";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getSiteSettings } from "@/lib/settings-db";

export default async function Footer() {
  const { socialLinks, storeAddress, contactEmail } = await getSiteSettings();
  const enabledSocials = (socialLinks || []).filter((s) => s.enabled && s.url);

  return (
    <footer className="mx-auto mb-10 px-4 text-sm lg:px-6">
      <div className="mb-6 h-[5px] w-full bg-current" />

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:gap-8">
        <div className="flex-1 text-[2.75rem] leading-[1] font-[900] tracking-tighter text-balance md:text-[6vw]">
          {TAGLINE_A}
          <br />
          {TAGLINE_B}
        </div>
        <div className="text-[2.75rem] leading-[1] font-[900] tracking-tighter md:text-[6vw]">
          <span className="inline-flex items-center">
            <span className="mr-[0.06em] inline-grid aspect-square place-items-center rounded-full border-[0.07em] border-current px-[0.16em] text-[0.72em]">
              c
            </span>
            {YEAR_MARK}
          </span>
        </div>
      </div>

      <div className="mt-[8rem] mb-4 md:mt-[16rem]">
        <p className="max-w-[52ch] tracking-tight text-balance md:text-2xl">{BLURB}</p>
      </div>

      {/* VIP Drop & Newsletter Waitlist */}
      <NewsletterSignup />

      <hr className="mb-6 h-[2px] w-full border-0 bg-current" />

      <div className="grid grid-cols-16 gap-x-6 gap-y-20 font-bold md:gap-6">
        <div className="order-last col-span-16 md:order-first md:col-span-4">
          <p>{BRAND}</p>
          <p className="text-xs opacity-60">By EmulsionStack</p>
          <p className="text-xs opacity-40 mt-1">All rights reserved © 2026</p>
        </div>
        <div className="col-span-8 md:col-span-4">
          <p className="opacity-80 leading-relaxed text-xs">{storeAddress}</p>
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block mt-2 font-mono text-xs opacity-60 hover:opacity-100 hover:underline"
            >
              {contactEmail}
            </a>
          )}
        </div>
        <div className="col-span-8 md:col-span-3">
          <ul className="flex flex-col gap-1 text-xs">
            <li className="font-mono uppercase opacity-40 mb-1">Legal</li>
            <li>
              <Link href="/privacy" data-cursor className="hover:underline underline-offset-4">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" data-cursor className="hover:underline underline-offset-4">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/refunds" data-cursor className="hover:underline underline-offset-4">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="order-first col-span-16 flex justify-between gap-6 md:order-last md:col-span-5">
          <ul className="flex flex-col gap-1 text-xs">
            <li className="font-mono uppercase opacity-40 mb-1">Studio</li>
            <li>
              <Link href="/about" data-cursor className="hover:underline underline-offset-4 font-semibold">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/" data-cursor className="hover:underline underline-offset-4">
                Collection
              </Link>
            </li>
            <li>
              <Link href="/wishlist" data-cursor className="hover:underline underline-offset-4">
                Wishlist
              </Link>
            </li>
          </ul>

          <ul className="flex flex-col gap-1">
            <li className="font-mono text-xs uppercase opacity-40 mb-1">Social</li>
            {enabledSocials.length === 0 ? (
              <li className="text-xs opacity-40 font-mono">None linked</li>
            ) : (
              enabledSocials.map((social) => (
                <li key={social.id || social.platform}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    className="hover:underline underline-offset-4 flex items-center gap-1 group"
                  >
                    <span>{social.label}</span>
                    <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                      ↗
                    </span>
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </footer>
  );
}
