import Link from "next/link";
import { BRAND, TAGLINE_A, TAGLINE_B, YEAR_MARK, BLURB } from "@/lib/site";
import NewsletterSignup from "@/components/NewsletterSignup";

const COLUMNS: { heading: string; links: string[] }[] = [
  { heading: "Studio", links: ["Work", "Services", "About", "Careers"] },
  { heading: "Social", links: ["Dribbble", "Instagram", "LinkedIn", "Twitter (X)"] },
];

export default function Footer() {
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
          <p>All rights reserved © 2026</p>
        </div>
        <div className="col-span-8 md:col-span-3">
          <p>Placeholder Street 1</p>
          <p>Unit 000</p>
          <p>Somewhere</p>
        </div>
        <div className="col-span-8 md:col-span-4">
          <Link href="/" data-cursor>
            Privacy Policy
          </Link>
        </div>
        <div className="order-first col-span-16 flex justify-between gap-6 md:order-last md:col-span-5">
          {COLUMNS.map((col) => (
            <ul key={col.heading} className="flex flex-col gap-1">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="/" data-cursor>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </footer>
  );
}
