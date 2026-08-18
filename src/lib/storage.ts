import { useCallback, useEffect, useState } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    setItems(read<T[]>(key, []));
    const onChange = () => setItems(read<T[]>(key, []));
    window.addEventListener("pka-storage", onChange);
    return () => window.removeEventListener("pka-storage", onChange);
  }, [key]);

  const write = useCallback(
    (next: T[]) => {
      window.localStorage.setItem(key, JSON.stringify(next));
      setItems(next);
      window.dispatchEvent(new Event("pka-storage"));
    },
    [key],
  );

  return [items, write] as const;
}

export type FavoriteKind = "pokemon" | "item" | "dungeon" | "guide";
export type Favorite = { kind: FavoriteKind; label: string; to: string };

const FAV_KEY = "pka:favorites";

export function useFavorites() {
  const [favorites, write] = useLocalList<Favorite>(FAV_KEY);

  const isFavorite = useCallback(
    (to: string) => favorites.some((f) => f.to === to),
    [favorites],
  );

  const toggle = useCallback(
    (fav: Favorite) => {
      const exists = favorites.some((f) => f.to === fav.to);
      write(exists ? favorites.filter((f) => f.to !== fav.to) : [fav, ...favorites]);
    },
    [favorites, write],
  );

  return { favorites, isFavorite, toggle };
}

export type HistoryEntry = { query: string; to: string; at: number };
const HIST_KEY = "pka:history";

export function pushHistory(entry: Omit<HistoryEntry, "at">) {
  if (typeof window === "undefined") return;
  const list = read<HistoryEntry[]>(HIST_KEY, []).filter((h) => h.to !== entry.to);
  const next = [{ ...entry, at: Date.now() }, ...list].slice(0, 20);
  window.localStorage.setItem(HIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("pka-storage"));
}

export function useHistory() {
  const [history, write] = useLocalList<HistoryEntry>(HIST_KEY);
  const clear = useCallback(() => write([]), [write]);
  return { history, clear };
}
