import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

import ThemeProvider, { themeScript } from "@/components/providers/ThemeProvider";
import { loaderScript } from "@/components/Preloader";
import BagProvider from "@/components/providers/BagProvider";
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
  title: `${BRAND}® — editorial commerce study`,
  description:
    "A sixteen-column editorial commerce layout with three inverted themes and a GSAP motion system.",
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
      <head>
        {/* Before first paint, so the stored theme never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
      </head>
      <body className="bg-cream text-black selection:bg-red selection:text-cream dark:bg-black dark:text-cream red:bg-cream red:text-red red:selection:bg-black">
        <ThemeProvider>
          <BagProvider>
            <SmoothScroll />
            <Nav />
            <ThemeSwitcher />
            {children}
            <Cursor />
            <TransitionLayer />
          </BagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
