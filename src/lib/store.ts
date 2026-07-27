'use client';

import { useCallback, useEffect, useState } from 'react';

const FAVORITES_KEY = 'tomosha:favorites';
const HISTORY_KEY = 'tomosha:history';
const SETTINGS_KEY = 'tomosha:settings';
const SYNC_EVENT = 'tomosha:store-sync';

export type HistoryEntry = { channelId: string; watchedAt: string; seconds: number };
export type Settings = { autoplay: boolean; reducedData: boolean; locale: 'uz' | 'ru' | 'en' };

const defaultSettings: Settings = { autoplay: true, reducedData: false, locale: 'uz' };

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {
    /* storage disabled, stay in memory for this session */
  }
}

function useSyncedValue<T>(key: string, fallback: T): [T, (next: T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(read(key, fallback));
    setReady(true);
    const sync = () => setValue(read(key, fallback));
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
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
  const [favorites, setFavorites, ready] = useSyncedValue<string[]>(FAVORITES_KEY, []);

  const isFavorite = useCallback((channelId: string) => favorites.includes(channelId), [favorites]);
  const toggle = useCallback(
    (channelId: string) => {
      const next = favorites.includes(channelId)
        ? favorites.filter((item) => item !== channelId)
        : [...favorites, channelId];
      setFavorites(next);
      return next.includes(channelId);
    },
    [favorites, setFavorites],
  );
  const clear = useCallback(() => setFavorites([]), [setFavorites]);

  return { favorites, ready, isFavorite, toggle, clear };
}

export function useHistory() {
  const [history, setHistory, ready] = useSyncedValue<HistoryEntry[]>(HISTORY_KEY, []);

  const record = useCallback(
    (channelId: string, seconds = 0) => {
      const next = [
        { channelId, watchedAt: new Date().toISOString(), seconds },
        ...history.filter((entry) => entry.channelId !== channelId),
      ].slice(0, 40);
      setHistory(next);
    },
    [history, setHistory],
  );
  const clear = useCallback(() => setHistory([]), [setHistory]);

  return { history, ready, record, clear };
}

export function useSettings() {
  const [settings, setSettings, ready] = useSyncedValue<Settings>(SETTINGS_KEY, defaultSettings);
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings({ ...settings, ...patch }),
    [settings, setSettings],
  );
  return { settings, ready, update };
}
