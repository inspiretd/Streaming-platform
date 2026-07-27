'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type HlsLevel = { height: number; bitrate: number };

export type HlsErrorData = { fatal: boolean; type: string; details: string };

export type HlsInstance = {
  loadSource: (url: string) => void;
  attachMedia: (media: HTMLMediaElement) => void;
  destroy: () => void;
  startLoad: (position?: number) => void;
  recoverMediaError: () => void;
  on: (event: string, handler: (event: string, data: HlsErrorData) => void) => void;
  levels: HlsLevel[];
  currentLevel: number;
  liveSyncPosition: number | null;
};

type HlsConstructor = {
  new (config?: Record<string, unknown>): HlsInstance;
  isSupported: () => boolean;
  Events: { MANIFEST_PARSED: string; ERROR: string; LEVEL_SWITCHED: string };
  ErrorTypes: { NETWORK_ERROR: string; MEDIA_ERROR: string };
};

declare global {
  // eslint-disable-next-line no-var
  var Hls: HlsConstructor | undefined;
}

/**
 * hls.js is loaded from a pinned CDN bundle at runtime so that no media library
 * is bundled into the initial page payload. Swap NEXT_PUBLIC_HLS_JS_URL for a
 * self hosted copy in production deployments.
 */
const HLS_URL = process.env.NEXT_PUBLIC_HLS_JS_URL ?? 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';

let loaderPromise: Promise<HlsConstructor | null> | null = null;

export function loadHlsLibrary(): Promise<HlsConstructor | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (globalThis.Hls) return Promise.resolve(globalThis.Hls);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<HlsConstructor | null>((resolve) => {
    const script = document.createElement('script');
    script.src = HLS_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve(globalThis.Hls ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export function nativeHlsSupported(video: HTMLVideoElement | null): boolean {
  if (!video) return false;
  return video.canPlayType('application/vnd.apple.mpegurl') !== '';
}

export function useHlsLibrary() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const ctorRef = useRef<HlsConstructor | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadHlsLibrary().then((ctor) => {
      if (cancelled) return;
      ctorRef.current = ctor;
      setReady(ctor !== null);
      setFailed(ctor === null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const create = useCallback((config?: Record<string, unknown>): HlsInstance | null => {
    const Ctor = ctorRef.current;
    if (!Ctor || !Ctor.isSupported()) return null;
    return new Ctor(config);
  }, []);

  return { ready, failed, create, ctorRef };
}
