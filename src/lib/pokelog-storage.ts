import { useCallback, useEffect, useState } from "react";

export interface PokelogState {
  completed: string[]; // List of completed pokemon names
  progress: Record<string, number>; // pokemon -> kills completed
  favorites: string[]; // List of prioritized/pinned pokemon
  notes: Record<string, string>; // pokemon -> player note
  lastUpdated: number;
}

const STORAGE_KEY = "pka:pokelogs_progress_v1";

const DEFAULT_STATE: PokelogState = {
  completed: [],
  progress: {},
  favorites: [],
  notes: {},
  lastUpdated: Date.now(),
};

function readStorage(): PokelogState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      progress: typeof parsed.progress === "object" && parsed.progress !== null ? parsed.progress : {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      notes: typeof parsed.notes === "object" && parsed.notes !== null ? parsed.notes : {},
      lastUpdated: parsed.lastUpdated || Date.now(),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeStorage(state: PokelogState) {
  if (typeof window === "undefined") return;
  try {
    const updated = { ...state, lastUpdated: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("pka-pokelogs-storage"));
  } catch (err) {
    console.error("Failed to write pokelog storage", err);
  }
}

export function usePokelogs() {
  const [state, setState] = useState<PokelogState>(readStorage);

  useEffect(() => {
    setState(readStorage());
    const onChange = () => setState(readStorage());
    window.addEventListener("pka-pokelogs-storage", onChange);
    return () => window.removeEventListener("pka-pokelogs-storage", onChange);
  }, []);

  const isCompleted = useCallback(
    (pokemon: string) => state.completed.includes(pokemon.toLowerCase().trim()),
    [state.completed],
  );

  const isFavorite = useCallback(
    (pokemon: string) => state.favorites.includes(pokemon.toLowerCase().trim()),
    [state.favorites],
  );

  const getProgress = useCallback(
    (pokemon: string) => state.progress[pokemon.toLowerCase().trim()] ?? 0,
    [state.progress],
  );

  const getNote = useCallback(
    (pokemon: string) => state.notes[pokemon.toLowerCase().trim()] ?? "",
    [state.notes],
  );

  const toggleCompleted = useCallback(
    (pokemon: string, totalQtd?: number | null) => {
      const key = pokemon.toLowerCase().trim();
      const exists = state.completed.includes(key);
      let nextCompleted: string[];
      let nextProgress = { ...state.progress };

      if (exists) {
        nextCompleted = state.completed.filter((k) => k !== key);
      } else {
        nextCompleted = [...state.completed, key];
        if (totalQtd && totalQtd > 0) {
          nextProgress[key] = totalQtd;
        }
      }

      writeStorage({
        ...state,
        completed: nextCompleted,
        progress: nextProgress,
      });
    },
    [state],
  );

  const setKills = useCallback(
    (pokemon: string, kills: number, totalQtd?: number | null) => {
      const key = pokemon.toLowerCase().trim();
      const val = Math.max(0, Math.floor(kills));
      const nextProgress = { ...state.progress, [key]: val };
      
      let nextCompleted = [...state.completed];
      if (totalQtd && val >= totalQtd && !nextCompleted.includes(key)) {
        nextCompleted.push(key);
      } else if (totalQtd && val < totalQtd && nextCompleted.includes(key)) {
        nextCompleted = nextCompleted.filter((k) => k !== key);
      }

      writeStorage({
        ...state,
        completed: nextCompleted,
        progress: nextProgress,
      });
    },
    [state],
  );

  const toggleFavorite = useCallback(
    (pokemon: string) => {
      const key = pokemon.toLowerCase().trim();
      const exists = state.favorites.includes(key);
      const nextFavorites = exists
        ? state.favorites.filter((k) => k !== key)
        : [...state.favorites, key];

      writeStorage({
        ...state,
        favorites: nextFavorites,
      });
    },
    [state],
  );

  const setNote = useCallback(
    (pokemon: string, note: string) => {
      const key = pokemon.toLowerCase().trim();
      writeStorage({
        ...state,
        notes: { ...state.notes, [key]: note },
      });
    },
    [state],
  );

  const markBatch = useCallback(
    (pokemons: string[], completed: boolean) => {
      const keys = pokemons.map((p) => p.toLowerCase().trim());
      let nextCompleted: string[];

      if (completed) {
        const set = new Set([...state.completed, ...keys]);
        nextCompleted = Array.from(set);
      } else {
        const removeSet = new Set(keys);
        nextCompleted = state.completed.filter((k) => !removeSet.has(k));
      }

      writeStorage({
        ...state,
        completed: nextCompleted,
      });
    },
    [state],
  );

  const resetAll = useCallback(() => {
    writeStorage(DEFAULT_STATE);
  }, []);

  const importState = useCallback((imported: Partial<PokelogState>) => {
    const newState: PokelogState = {
      completed: Array.isArray(imported.completed) ? imported.completed : [],
      progress: typeof imported.progress === "object" && imported.progress !== null ? imported.progress : {},
      favorites: Array.isArray(imported.favorites) ? imported.favorites : [],
      notes: typeof imported.notes === "object" && imported.notes !== null ? imported.notes : {},
      lastUpdated: Date.now(),
    };
    writeStorage(newState);
  }, []);

  return {
    state,
    completedCount: state.completed.length,
    isCompleted,
    isFavorite,
    getProgress,
    getNote,
    toggleCompleted,
    setKills,
    toggleFavorite,
    setNote,
    markBatch,
    resetAll,
    importState,
  };
}
