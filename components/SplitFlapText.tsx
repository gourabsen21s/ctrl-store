"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const DEFAULT_WORDS = ["CTRL", "+", "STYLE"];

const CHARSETS: Record<string, string> = {
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  numeric: "0123456789",
  symbols: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/=!#@?.",
};

const toCssUnit = (value: number | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : String(value);
};

const resolveCharset = (charset: string | undefined): string => {
  if (charset && CHARSETS[charset]) return CHARSETS[charset];
  if (typeof charset === "string" && charset.length > 0) return charset;
  return CHARSETS.symbols;
};

interface TileState {
  current: string;
  next: string;
  flipping: boolean;
  tick: number;
}

const sampleChar = (charset: string): string =>
  charset.charAt(Math.floor(Math.random() * charset.length)) || "A";

const createTilesForWord = (word: string): TileState[] =>
  word.split("").map((ch) => ({
    current: ch,
    next: ch,
    flipping: false,
    tick: 0,
  }));

const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReduced(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
};

export interface SplitFlapTextProps {
  words?: string[];
  text?: string;
  flipDuration?: number;
  stagger?: number;
  cycleDelay?: number;
  charset?: string;
  flipsPerChar?: number;
  tileColor?: string;
  textColor?: string;
  tileRadius?: number | string;
  gap?: number | string;
  fontSize?: number | string;
  loop?: boolean;
  padTo?: number;
  align?: "start" | "center" | "end" | "justify";
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const renderChar = (ch: string) => {
  if (ch === " ") return "\u00A0";
  if (ch === "+") {
    return (
      <span className="inline-block scale-[1.48] -translate-y-[0.03em] leading-none font-[900] select-none">
        {ch}
      </span>
    );
  }
  return ch;
};

export default function SplitFlapText({
  words = DEFAULT_WORDS,
  text,
  flipDuration = 0.08,
  stagger = 0.03,
  cycleDelay = 2400,
  charset = "symbols",
  flipsPerChar = 5,
  tileColor = "transparent",
  textColor = "currentColor",
  tileRadius = 0,
  fontSize = "clamp(4.25rem, 18vw, 17rem)",
  loop = true,
  className = "",
  style = {},
  onClick,
  ...props
}: SplitFlapTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<number | null>(null);

  const sourceWords = useMemo(() => {
    if (typeof text === "string" && text.length > 0) return [text];
    if (Array.isArray(words) && words.length > 0) return words;
    return DEFAULT_WORDS;
  }, [words, text]);

  const wordIndexRef = useRef<number>(0);
  const [activeWord, setActiveWord] = useState<string>(() => sourceWords[0] || "CTRL");
  const activeWordRef = useRef<string>(sourceWords[0] || "CTRL");
  const [activeTiles, setActiveTiles] = useState<TileState[]>(() =>
    createTilesForWord(sourceWords[0] || "CTRL")
  );
  const activeTilesRef = useRef<TileState[]>(createTilesForWord(sourceWords[0] || "CTRL"));

  const [exitingWord, setExitingWord] = useState<string | null>(null);
  const [exitingTiles, setExitingTiles] = useState<TileState[] | null>(null);

  const transitionToRef = useRef<((nextIndex: number) => number) | null>(null);
  const scheduleNextRef = useRef<((delay: number) => void) | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
    };

    clearTimers();

    const initialWord = sourceWords[0] || "CTRL";
    wordIndexRef.current = 0;
    activeWordRef.current = initialWord;
    activeTilesRef.current = createTilesForWord(initialWord);
    setActiveWord(initialWord);
    setActiveTiles(activeTilesRef.current);
    setExitingWord(null);
    setExitingTiles(null);

    if (sourceWords.length <= 1 || typeof window === "undefined") {
      return clearTimers;
    }

    let cancelled = false;
    const safeFlipMs = Math.max(30, (Number(flipDuration) || 0.08) * 1000);
    const safeStaggerMs = Math.max(0, (Number(stagger) || 0.03) * 1000);
    const safeCycleDelay = Math.max(400, Number(cycleDelay) || 2400);
    const safeFlips = Math.max(1, Math.floor(Number(flipsPerChar) || 5));
    const activeCharset = resolveCharset(charset);

    const transitionTo = (targetIndex: number): number => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const nextTarget = sourceWords[targetIndex];
      wordIndexRef.current = targetIndex;

      const prevWord = activeWordRef.current;
      const prevTiles = activeTilesRef.current;
      activeWordRef.current = nextTarget;

      if (prefersReducedMotion) {
        const directTiles = createTilesForWord(nextTarget);
        activeTilesRef.current = directTiles;
        setActiveWord(nextTarget);
        setActiveTiles(directTiles);
        setExitingWord(null);
        setExitingTiles(null);
        return 0;
      }

      // Exiting word: rapid 1-step flip down to blank
      const exitingPlans = prevWord.split("").map((_, i) => ({
        index: i,
        start: i * (safeStaggerMs * 0.4),
        duration: safeFlipMs,
        done: false,
      }));

      // Entering word: sequential mechanical flip through symbols to target letter
      const enteringPlans = nextTarget.split("").map((targetChar, i) => {
        const seq: string[] = [];
        for (let f = 0; f < safeFlips; f++) {
          seq.push(sampleChar(activeCharset));
        }
        seq.push(targetChar);

        return {
          index: i,
          target: targetChar,
          sequence: seq,
          start: i * safeStaggerMs,
          step: -1,
          done: false,
        };
      });

      // Mount exiting tiles
      setExitingWord(prevWord);
      setExitingTiles(
        prevTiles.map((t) => ({
          ...t,
          flipping: true,
          next: " ",
          tick: t.tick + 1,
        }))
      );

      // Mount entering tiles starting at blank
      const initialEnteringTiles = nextTarget.split("").map(() => ({
        current: " ",
        next: sampleChar(activeCharset),
        flipping: true,
        tick: 1,
      }));
      activeTilesRef.current = initialEnteringTiles;
      setActiveWord(nextTarget);
      setActiveTiles(initialEnteringTiles);

      const totalDuration = enteringPlans.reduce(
        (max, plan) => Math.max(max, plan.start + plan.sequence.length * safeFlipMs),
        0
      );
      const startedAt = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;

        const elapsed = now - startedAt;
        let shouldContinue = false;

        // Process exiting tiles
        let allExitingDone = true;
        exitingPlans.forEach((plan) => {
          if (!plan.done) {
            if (elapsed >= plan.start + plan.duration) {
              plan.done = true;
            } else {
              allExitingDone = false;
              shouldContinue = true;
            }
          }
        });

        if (allExitingDone) {
          setExitingWord(null);
          setExitingTiles(null);
        }

        // Process entering tiles
        const enteringUpdates: { index: number; current: string; next: string; done: boolean }[] = [];
        enteringPlans.forEach((plan) => {
          const localElapsed = elapsed - plan.start;
          if (localElapsed < 0) {
            shouldContinue = true;
            return;
          }

          const step = Math.floor(localElapsed / safeFlipMs);
          if (step < plan.sequence.length) {
            shouldContinue = true;
            if (step !== plan.step) {
              plan.step = step;
              enteringUpdates.push({
                index: plan.index,
                current: step === 0 ? " " : plan.sequence[step - 1],
                next: plan.sequence[step],
                done: false,
              });
            }
          } else if (!plan.done) {
            plan.done = true;
            enteringUpdates.push({
              index: plan.index,
              current: plan.target,
              next: plan.target,
              done: true,
            });
          }
        });

        if (enteringUpdates.length > 0) {
          setActiveTiles((prev) => {
            const next = [...prev];
            enteringUpdates.forEach((u) => {
              if (!next[u.index]) return;
              next[u.index] = {
                current: u.current,
                next: u.next,
                flipping: !u.done,
                tick: next[u.index].tick + 1,
              };
            });
            return next;
          });
        }

        if (shouldContinue) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          const finalTiles = createTilesForWord(nextTarget);
          activeTilesRef.current = finalTiles;
          setActiveTiles(finalTiles);
          setExitingWord(null);
          setExitingTiles(null);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);
      return totalDuration;
    };

    transitionToRef.current = transitionTo;

    const scheduleNext = (delay: number) => {
      cycleTimerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        const nextIdx = wordIndexRef.current + 1;
        if (nextIdx >= sourceWords.length && !loop) return;

        const wrappedIdx = nextIdx % sourceWords.length;
        const animDuration = transitionTo(wrappedIdx);
        scheduleNext(safeCycleDelay + animDuration);
      }, delay);
    };

    scheduleNextRef.current = scheduleNext;
    scheduleNext(safeCycleDelay);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [
    sourceWords,
    loop,
    cycleDelay,
    flipDuration,
    stagger,
    flipsPerChar,
    charset,
    prefersReducedMotion,
  ]);

  const handleAdvance = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (sourceWords.length <= 1 || !transitionToRef.current) return;

    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }

    const nextIdx = (wordIndexRef.current + 1) % sourceWords.length;
    const duration = transitionToRef.current(nextIdx);
    if (loop && scheduleNextRef.current) {
      const safeCycleDelay = Math.max(400, Number(cycleDelay) || 2400);
      scheduleNextRef.current(safeCycleDelay + duration);
    }
  };

  const componentStyle = {
    "--split-flap-tile-color": tileColor,
    "--split-flap-text-color": textColor,
    "--split-flap-radius": toCssUnit(tileRadius),
    "--split-flap-font-size": toCssUnit(fontSize),
    "--split-flap-flip-duration": `${Math.max(0.03, Number(flipDuration) || 0.08)}s`,
    ...style,
  } as CSSProperties;

  const renderTile = (tile: TileState, key: string) => (
    <span
      className="split-flap-text__tile"
      data-empty={tile.current === " " && !tile.flipping}
      aria-hidden="true"
      key={key}
    >
      {/* Static Top Half */}
      <span className="split-flap-text__half split-flap-text__half--top">
        <span className="split-flap-text__char">{renderChar(tile.current)}</span>
      </span>

      {/* Static Bottom Half */}
      <span className="split-flap-text__half split-flap-text__half--bottom">
        <span className="split-flap-text__char">
          {renderChar(tile.flipping ? tile.next : tile.current)}
        </span>
      </span>

      {/* Dynamic Flipping Flaps */}
      {tile.flipping && (
        <>
          <span
            className="split-flap-text__flap split-flap-text__flap--front"
            key={`front-${key}-${tile.tick}`}
          >
            <span className="split-flap-text__char">{renderChar(tile.current)}</span>
          </span>

          <span
            className="split-flap-text__flap split-flap-text__flap--back"
            key={`back-${key}-${tile.tick}`}
          >
            <span className="split-flap-text__char">{renderChar(tile.next)}</span>
          </span>
        </>
      )}
    </span>
  );

  return (
    <div
      className={`split-flap-text select-none cursor-pointer w-full relative ${className}`.trim()}
      style={componentStyle}
      role="text"
      aria-label={activeWord}
      onClick={handleAdvance}
      title="Click to cycle word"
      {...props}
    >
      {/* Active word row: full-width space-between for multi-letter words, centered for + */}
      <div
        className={`w-full flex items-center ${
          activeWord.length > 1 ? "justify-between" : "justify-center"
        }`}
      >
        {activeTiles.map((tile, index) =>
          renderTile(tile, `active-${activeWord}-${index}`)
        )}
      </div>

      {/* Exiting word row (briefly visible during the flip transition) */}
      {exitingWord && exitingTiles && (
        <div
          className={`w-full flex items-center absolute inset-0 pointer-events-none ${
            exitingWord.length > 1 ? "justify-between" : "justify-center"
          }`}
        >
          {exitingTiles.map((tile, index) =>
            renderTile(tile, `exit-${exitingWord}-${index}`)
          )}
        </div>
      )}
    </div>
  );
}
