import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import ThemeProvider, { themeScript } from "@/components/providers/ThemeProvider";
import { loaderScript } from "@/components/Preloader";
import BagProvider from "@/components/providers/BagProvider";
import WishlistProvider from "@/components/providers/WishlistProvider";
import WishlistDrawer from "@/components/WishlistDrawer";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Nav from "@/components/Nav";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Cursor from "@/components/Cursor";
import TransitionLayer from "@/components/TransitionLayer";
import { BRAND } from "@/lib/site";

// Variable width axis lets the display wordmark run wide without a second family.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND}® — Signature Apparel & Goods`,
  description:
    "Curated apparel, heavy-gauge fleece, and tactical carry. Designed and crafted with precision.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BRAND,
    title: `${BRAND}® // Signature Apparel & Goods`,
    description: "Curated apparel, heavy-gauge fleece, and tactical carry.",
    images: [
      {
        url: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289451/ctrl-store/products/heavy-tee-black-front.jpg",
        width: 1200,
        height: 630,
        alt: `${BRAND} Signature Collection`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND}® // Signature Apparel & Goods`,
    description: "Curated apparel, heavy-gauge fleece, and tactical carry.",
    images: [
      "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289451/ctrl-store/products/heavy-tee-black-front.jpg",
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="red"
      // The inline script below rewrites this before hydration, by design.
      suppressHydrationWarning
      className={`${archivo.variable} antialiased`}
    >
      <head suppressHydrationWarning />
      <body className="bg-cream text-black selection:bg-red selection:text-cream dark:bg-black dark:text-cream red:bg-cream red:text-red red:selection:bg-black">
        {/* Before first paint, so the stored theme and loader never flash. */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <Script
          id="loader-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: loaderScript }}
        />
        <ThemeProvider>
          <BagProvider>
            <WishlistProvider>
              <SmoothScroll />
              <Nav />
              <ThemeSwitcher />
              {children}
              <WishlistDrawer />
              <Cursor />
              <TransitionLayer />
            </WishlistProvider>
          </BagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
