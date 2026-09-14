import Link from "next/link";
import { BRAND, TAGLINE_A, TAGLINE_B, YEAR_MARK, BLURB } from "@/lib/site";
import Mark from "@/components/Mark";
import { getSiteSettings } from "@/lib/settings-db";

export default async function Footer() {
  const { storeAddress, contactEmail } = await getSiteSettings();

  return (
    <footer className="mx-auto mb-10 px-4 text-sm lg:px-6">
      <div className="mb-6 h-[5px] w-full bg-current" />

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:gap-8">
        <div className="flex-1 text-[2.75rem] leading-[1] font-[900] tracking-tighter text-balance md:text-[6vw]">
          <p>{TAGLINE_A}</p>
          <p className="red:text-red text-[#5A5A5A]">{TAGLINE_B}</p>
        </div>
        <div>
          <p className="text-[45vw] leading-[1] font-[900] tracking-tighter md:text-[12.75vw]">
            ©{YEAR_MARK}
          </p>
        </div>
      </div>

      <div className="mt-[8rem] mb-4 md:mt-[16rem]">
        <p className="max-w-[52ch] tracking-tight text-balance md:text-2xl">{BLURB}</p>
      </div>

      <hr className="mb-6 h-[2px] w-full border-0 bg-current" />

      <div className="grid grid-cols-16 gap-x-6 gap-y-20 font-bold md:gap-6">
        <div className="order-last col-span-16 md:order-first md:col-span-4">
          <div className="flex flex-col">
            <Link href="/" className="mb-2 inline-block">
              <Mark className="h-[1.5em] w-[3.375em]" />
              <span className="sr-only">{BRAND}®</span>
            </Link>
            <span>All rights reserved ©&nbsp;{YEAR_MARK}</span>
          </div>
        </div>

        <div className="col-span-8 md:col-span-3">
          {storeAddress || (
            <>
              108 Brigade Road <br /> Office 102 <br /> Bengaluru, India
            </>
          )}
        </div>

        <div className="col-span-8 md:col-span-4">
          <Link href="/privacy" data-cursor className="link-hover max-w-fit">
            Privacy Policy
          </Link>
        </div>

        <div className="order-first col-span-16 flex justify-evenly md:order-last md:col-span-5">
          <div className="flex flex-1 flex-col gap-3">
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noreferrer noopener"
              data-cursor
              className="link-hover max-w-fit"
            >
              Dribbble
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              data-cursor
              className="link-hover max-w-fit"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer noopener"
              data-cursor
              className="link-hover max-w-fit"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer noopener"
              data-cursor
              className="link-hover max-w-fit"
            >
              Twitter (X)
            </a>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <Link href="/store" data-cursor className="link-hover max-w-fit">
              Work
            </Link>
            <Link href="/store" data-cursor className="link-hover max-w-fit">
              Services
            </Link>
            <Link href="/about" data-cursor className="link-hover max-w-fit">
              About
            </Link>
            <Link href="/contact" data-cursor className="link-hover max-w-fit">
              Careers
            </Link>
          </div>

          <div className="flex-1">
            <a
              href={`mailto:${contactEmail || "concierge@ctrlstyle.com"}`}
              data-cursor
              className="link-hover max-w-fit"
            >
              Let's talk
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
