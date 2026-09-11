"use client";

import { useEffect, useState } from "react";
import Preloader from "@/components/Preloader";

const KEY = "outfit-seen-loader";

/**
 * The full loader runs once per tab. Coming back to the home page from a
 * product shouldn't replay a six-second intro.
 */
export default function HomeLoader() {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* private mode — just show it */
    }
    if (seen) {
      document.documentElement.classList.add("ready", "loaded");
      setShow(false);
      return;
    }
    setShow(true);
  }, []);

  if (show !== true) return null;

  return (
    <Preloader
      onDone={() => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
      }}
    />
  );
}
