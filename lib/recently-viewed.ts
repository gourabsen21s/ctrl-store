export interface RecentlyViewedItem {
  handle: string;
  title: string;
  price: number;
  category: string;
  image: string;
  color?: string;
  aspect?: string;
}

const STORAGE_KEY = "ctrl_recently_viewed";
const MAX_ITEMS = 8;

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedItem[];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === "undefined" || !item.handle) return;
  try {
    const existing = getRecentlyViewed();
    // Remove if already in list to move it to the front
    const filtered = existing.filter((i) => i.handle !== item.handle);
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Trigger custom event so other components on page update immediately
    window.dispatchEvent(new Event("recently_viewed_updated"));
  } catch {
    /* Ignore localStorage quota or private mode */
  }
}
