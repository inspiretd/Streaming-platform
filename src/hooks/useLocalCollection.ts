'use client';

import { useCallback, useEffect, useState } from 'react';

export type HistoryEntry = { slug: string; at: string };
export type PlayerSettings = { autoplay: boolean; reducedData: boolean; locale: 'uz' | 'ru' | 'en' };

const FAVORITES_KEY = 'tomosha.favorites';
const HISTORY_KEY = 'tomosha.history';
const SETTINGS_KEY = 'tomosha.settings';

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function subscribe(key: string, listener: Listener): () => void {
  const set = listeners.get(key) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(key, set);
  return () => set.delete(listener);
}

function emit(key: string): void {
  const set = listeners.get(key);
  if (!set) return;
  for (const listener of set) listener();
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage may be unavailable in private mode; user state stays in memory
  }
  emit(key);
}

function useStoredValue<T>(key: string, fallback: T): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(read(key, fallback));
    setReady(true);
    const unsubscribe = subscribe(key, () => setValue(read(key, fallback)));
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return [value, update, ready];
}

export function useFavorites() {
  const [slugs, setSlugs, ready] = useStoredValue<string[]>(FAVORITES_KEY, []);

  const toggle = useCallback(
    (slug: string) => {
      const next = slugs.includes(slug) ? slugs.filter((item) => item !== slug) : [slug, ...slugs];
      setSlugs(next);
      return next.includes(slug);
    },
    [slugs, setSlugs],
  );

  const isFavorite = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const clear = useCallback(() => setSlugs([]), [setSlugs]);

  return { slugs, ready, toggle, isFavorite, clear };
}

export function useWatchHistory() {
  const [entries, setEntries, ready] = useStoredValue<HistoryEntry[]>(HISTORY_KEY, []);

  const push = useCallback(
    (slug: string) => {
      const next = [{ slug, at: new Date().toISOString() }, ...entries.filter((entry) => entry.slug !== slug)].slice(0, 40);
      setEntries(next);
    },
    [entries, setEntries],
  );

  const remove = useCallback(
    (slug: string) => setEntries(entries.filter((entry) => entry.slug !== slug)),
    [entries, setEntries],
  );

  const clear = useCallback(() => setEntries([]), [setEntries]);

  return { entries, ready, push, remove, clear };
}

export function usePlayerSettings() {
  const [settings, setSettings, ready] = useStoredValue<PlayerSettings>(SETTINGS_KEY, {
    autoplay: true,
    reducedData: false,
    locale: 'uz',
  });

  const update = useCallback(
    (patch: Partial<PlayerSettings>) => setSettings({ ...settings, ...patch }),
    [settings, setSettings],
  );

  return { settings, ready, update };
}
