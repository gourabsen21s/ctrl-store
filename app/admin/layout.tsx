import Link from "next/link";
import Mark from "@/components/Mark";

export const metadata = {
  title: "Admin Panel — CTRL + STYLE",
  description: "Manage product inventory, catalogue, and media assets",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#f2efe9] font-sans antialiased selection:bg-red selection:text-white">
      {/* Top brutalist admin bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-opacity hover:opacity-75" title="Storefront">
              <Mark className="h-5 w-10 text-white" />
            </Link>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-red font-bold">
                ADMIN
              </span>
              <span className="text-xs text-white/40 hidden sm:inline">|</span>
              <span className="text-xs text-white/60 hidden sm:inline">Catalog Management</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-white/60 hover:text-white transition-colors"
            >
              <span>View Storefront</span>
              <span>↗</span>
            </Link>
            <div className="h-3 w-[1px] bg-white/20 hidden sm:block" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Mode
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
