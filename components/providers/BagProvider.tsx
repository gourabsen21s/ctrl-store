"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type BagLine = {
  handle: string;
  title: string;
  price: number;
  size: string;
  qty: number;
  image: string;
};

type Ctx = {
  lines: BagLine[];
  count: number;
  subtotal: number;
  add: (line: BagLine) => void;
  remove: (handle: string, size: string) => void;
  clearBag: () => void;
};

const BagContext = createContext<Ctx | null>(null);

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside BagProvider");
  return ctx;
}

const KEY = "outfit-bag";

/**
 * Session-scoped rather than a real cart — this build is a design study. It
 * still survives a reload, because a bag that silently empties on refresh
 * reads as a bug rather than as a deliberate limitation.
 */
export default function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate after mount so server and client markup agree on the first pass.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as BagLine[]);
    } catch {
      /* unreadable or malformed — start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    // Gated on state, not a ref: both effects run in the same commit, so a ref
    // flipped above would still let this write the empty initial state back
    // over what was stored. Waiting for the re-render is what makes it safe.
    if (!ready) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* quota or private mode — the bag just won't survive a reload */
    }
  }, [lines, ready]);

  const value = useMemo<Ctx>(() => {
    const add = (line: BagLine) =>
      setLines((prev) => {
        const i = prev.findIndex((l) => l.handle === line.handle && l.size === line.size);
        if (i === -1) return [...prev, line];
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + line.qty };
        return next;
      });

    const remove = (handle: string, size: string) =>
      setLines((prev) => prev.filter((l) => !(l.handle === handle && l.size === size)));

    const clearBag = () => setLines([]);

    return {
      lines,
      add,
      remove,
      clearBag,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
    };
  }, [lines]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}
