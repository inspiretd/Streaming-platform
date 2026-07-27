'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Search, X } from 'lucide-react';

type SearchItem = {
  id: string;
  slug: string;
  name: string;
  monogram: string;
  accent: string;
  category: string;
  country: string;
  quality: string;
  status: string;
};

type SearchContextValue = { open: () => void; close: () => void; isOpen: boolean };

const SearchContext = createContext<SearchContextValue>({ open: () => undefined, close: () => undefined, isOpen: false });

export function useSearchOverlay(): SearchContextValue {
  return useContext(SearchContext);
}

const RECENT_KEY = 'tomosha.recent-searches';

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((current) => !current);
      }
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const stored = window.localStorage.getItem(RECENT_KEY);
    setRecent(stored ? (JSON.parse(stored) as string[]).slice(0, 5) : []);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length === 0) {
      setItems([]);
      setLoading(false);
      setErrored(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setErrored(false);
    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((payload: { ok: boolean; data?: { items: SearchItem[] } }) => {
          setItems(payload.ok && payload.data ? payload.data.items : []);
          setLoading(false);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setErrored(true);
          setLoading(false);
        });
    }, 220);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, isOpen]);

  const remember = useCallback((value: string) => {
    if (value.trim().length === 0) return;
    setRecent((current) => {
      const next = [value, ...current.filter((item) => item !== value)].slice(0, 5);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              key="search-backdrop"
              className="overlay-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={close}
            />
            <motion.div
              key="search-panel"
              className="search-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Search TOMOSHA"
              initial={{ opacity: 0, scale: 0.985, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="search-head">
                <Search size={18} aria-hidden="true" />
                <input
                  ref={inputRef}
                  className="search-input"
                  placeholder="Search channels, categories, countries"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search query"
                />
                {loading ? <Loader2 size={16} aria-hidden="true" /> : null}
                <button type="button" className="icon-btn" onClick={close} aria-label="Close search">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="search-results">
                {errored ? (
                  <p className="notice notice-danger">Search is unavailable right now. Try again in a moment.</p>
                ) : null}

                {!errored && query.trim().length === 0 ? (
                  <div style={{ padding: 12, display: 'grid', gap: 10 }}>
                    <span className="filter-label">Recent searches</span>
                    {recent.length === 0 ? (
                      <p className="feature-text">Start typing to find a channel. Cyrillic and Latin spellings both work.</p>
                    ) : (
                      <div className="chip-row">
                        {recent.map((item) => (
                          <button key={item} type="button" className="chip" onClick={() => setQuery(item)}>
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {!errored && query.trim().length > 0 && !loading && items.length === 0 ? (
                  <p className="feature-text" style={{ padding: 16 }}>
                    Nothing matched that search. Try a shorter query or browse the live catalog.
                  </p>
                ) : null}

                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.16) }}
                  >
                    <Link
                      href={`/live/${item.slug}`}
                      className="search-row"
                      onClick={() => {
                        remember(query);
                        close();
                      }}
                    >
                      <span className="search-thumb" style={{ background: item.accent }} aria-hidden="true">
                        {item.monogram}
                      </span>
                      <span style={{ display: 'grid' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {item.category} · {item.country} · {item.quality}
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </SearchContext.Provider>
  );
}
