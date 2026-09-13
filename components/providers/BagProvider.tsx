"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type IGamificationSettings,
  DEFAULT_GAMIFICATION_SETTINGS,
} from "@/lib/settings-types";

export type BagLine = {
  handle: string;
  title: string;
  price: number;
  size: string;
  qty: number;
  image: string;
  isFreeGift?: boolean;
};

export const FREE_SHIPPING_THRESHOLD = DEFAULT_GAMIFICATION_SETTINGS.freeShippingThreshold;
export const FREE_GIFT_THRESHOLD = DEFAULT_GAMIFICATION_SETTINGS.freeGiftThreshold;

export const FREE_GIFT_ITEM: BagLine = {
  handle: DEFAULT_GAMIFICATION_SETTINGS.freeGiftHandle,
  title: DEFAULT_GAMIFICATION_SETTINGS.freeGiftTitle,
  price: 0,
  size: "One size",
  qty: 1,
  image: DEFAULT_GAMIFICATION_SETTINGS.freeGiftImage,
  isFreeGift: true,
};

type Ctx = {
  lines: BagLine[];
  count: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (line: BagLine, openDrawerOnAdd?: boolean) => void;
  remove: (handle: string, size: string) => void;
  updateQty: (handle: string, size: string, qty: number) => void;
  clearBag: () => void;
  freeShippingUnlocked: boolean;
  freeGiftUnlocked: boolean;
  gamificationSettings: IGamificationSettings;
};

const BagContext = createContext<Ctx | null>(null);

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside BagProvider");
  return ctx;
}

const KEY = "outfit-bag";

export default function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [gamificationSettings, setGamificationSettings] = useState<IGamificationSettings>(
    DEFAULT_GAMIFICATION_SETTINGS
  );

  // Fetch live gamification settings from MongoDB
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.gamificationSettings) {
          setGamificationSettings({
            ...DEFAULT_GAMIFICATION_SETTINGS,
            ...data.gamificationSettings,
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch gamification settings:", err);
      });
  }, []);

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
    if (!ready) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* quota or private mode */
    }
  }, [lines, ready]);

  // Subtotal without free gift items
  const subtotal = useMemo(() => {
    return lines
      .filter((l) => !l.isFreeGift)
      .reduce((n, l) => n + l.qty * l.price, 0);
  }, [lines]);

  const freeShippingUnlocked = Boolean(
    gamificationSettings.enabled &&
      subtotal >= (gamificationSettings.freeShippingThreshold || 0)
  );

  const freeGiftUnlocked = Boolean(
    gamificationSettings.enabled &&
      gamificationSettings.freeGiftThreshold > 0 &&
      subtotal >= gamificationSettings.freeGiftThreshold
  );

  const dynamicFreeGiftItem = useMemo<BagLine>(() => {
    return {
      handle: gamificationSettings.freeGiftHandle || DEFAULT_GAMIFICATION_SETTINGS.freeGiftHandle,
      title: gamificationSettings.freeGiftTitle || DEFAULT_GAMIFICATION_SETTINGS.freeGiftTitle,
      price: 0,
      size: "One size",
      qty: 1,
      image: gamificationSettings.freeGiftImage || DEFAULT_GAMIFICATION_SETTINGS.freeGiftImage,
      isFreeGift: true,
    };
  }, [gamificationSettings]);

  // Automatically inject or remove the Free Gift line item based on dynamic subtotal & admin toggle
  useEffect(() => {
    if (!ready) return;

    setLines((prev) => {
      const hasGift = prev.some((l) => l.isFreeGift);
      if (freeGiftUnlocked && !hasGift) {
        return [...prev, dynamicFreeGiftItem];
      } else if (!freeGiftUnlocked && hasGift) {
        return prev.filter((l) => !l.isFreeGift);
      } else if (freeGiftUnlocked && hasGift) {
        // Update gift details if admin customized title or image
        return prev.map((l) => (l.isFreeGift ? { ...dynamicFreeGiftItem, qty: 1 } : l));
      }
      return prev;
    });
  }, [freeGiftUnlocked, ready, dynamicFreeGiftItem]);

  const value = useMemo<Ctx>(() => {
    const add = (line: BagLine, openDrawerOnAdd = true) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.handle === line.handle && l.size === line.size);
        if (i === -1) return [...prev, line];
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + line.qty };
        return next;
      });
      if (openDrawerOnAdd) {
        setIsDrawerOpen(true);
      }
    };

    const remove = (handle: string, size: string) => {
      setLines((prev) => prev.filter((l) => !(l.handle === handle && l.size === size)));
    };

    const updateQty = (handle: string, size: string, qty: number) => {
      if (qty <= 0) {
        remove(handle, size);
        return;
      }
      setLines((prev) =>
        prev.map((l) => (l.handle === handle && l.size === size ? { ...l, qty } : l))
      );
    };

    const clearBag = () => setLines([]);
    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    return {
      lines,
      add,
      remove,
      updateQty,
      clearBag,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      freeShippingUnlocked,
      freeGiftUnlocked,
      gamificationSettings,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
    };
  }, [lines, isDrawerOpen, subtotal, freeShippingUnlocked, freeGiftUnlocked, gamificationSettings]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

