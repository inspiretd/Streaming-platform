'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Keyboard, Loader2, ShieldAlert, WifiOff } from 'lucide-react';
import type { Channel, PlaybackSessionResult } from '@/lib/types';
import type { HlsInstance, HlsLevel } from '@/hooks/useHls';
import { nativeHlsSupported, useHlsLibrary } from '@/hooks/useHls';
import { PlayerControls } from '@/components/player/PlayerControls';
import { Dialog } from '@/components/ui/Overlay';
import { useToast } from '@/components/ui/Toast';
import { usePlayerSettings, useWatchHistory } from '@/hooks/useLocalCollection';

type PlaybackState = 'connecting' | 'live' | 'buffering' | 'reconnecting' | 'paused' | 'offline' | 'error';

export type PlaybackEventName =
  | 'play_requested'
  | 'manifest_loaded'
  | 'first_frame'
  | 'buffering_start'
  | 'buffering_end'
  | 'quality_changed'
  | 'error'
  | 'stop';

const REPORT_REASONS: { id: string; label: string }[] = [
  { id: 'no_signal', label: 'No signal' },
  { id: 'bad_quality', label: 'Poor quality' },
  { id: 'wrong_program', label: 'Wrong program' },
  { id: 'audio_issue', label: 'Audio issue' },
  { id: 'other', label: 'Something else' },
];

const STATE_LABEL: Record<PlaybackState, string> = {
  connecting: 'Connecting to the stream',
  live: 'Live',
  buffering: 'Buffering',
  reconnecting: 'Reconnecting',
  paused: 'Paused',
  offline: 'You are offline',
  error: 'Playback error',
};

export function TomoshaPlayer({ channel, onEvent }: { channel: Channel; onEvent?: (event: PlaybackEventName) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<HlsInstance | null>(null);
  const retriesRef = useRef(0);
  const historyRef = useRef(false);

  const { create, failed } = useHlsLibrary();
  const { push: pushToast } = useToast();
  const { push: pushHistory } = useWatchHistory();
  const { settings } = usePlayerSettings();

  const [state, setState] = useState<PlaybackState>('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [fullscreen, setFullscreen] = useState(false);
  const [levels, setLevels] = useState<HlsLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const emit = useCallback(
    (event: PlaybackEventName) => {
      if (onEvent) onEvent(event);
    },
    [onEvent],
  );

  useEffect(() => {
    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    setState('connecting');
    setErrorMessage('');
    emit('play_requested');

    const start = async () => {
      try {
        const response = await fetch(`/api/playback/${channel.id}/session`, { method: 'POST' });
        const payload = (await response.json()) as PlaybackSessionResult;
        if (cancelled) return;

        if (!payload.ok) {
          setErrorMessage(payload.message);
          setState('error');
          emit('error');
          return;
        }

        setNotice(payload.policy.notice);
        const instance = create({ lowLatencyMode: true, backBufferLength: 45, capLevelToPlayerSize: settings.reducedData });

        if (instance) {
          hlsRef.current = instance;
          instance.attachMedia(video);
          instance.loadSource(payload.source.url);

          instance.on('hlsManifestParsed', () => {
            if (cancelled) return;
            setLevels(instance.levels ?? []);
            setState('live');
            emit('manifest_loaded');
            if (settings.autoplay) {
              video.muted = true;
              void video.play().catch(() => undefined);
            }
          });

          instance.on('hlsLevelSwitched', () => {
            if (cancelled) return;
            setCurrentLevel(instance.currentLevel);
            emit('quality_changed');
          });

          instance.on('hlsError', (_event, data) => {
            if (cancelled || !data.fatal) return;
            if (data.type === 'networkError') {
              retriesRef.current += 1;
              if (retriesRef.current > 3) {
                setErrorMessage('The stream could not be reached after several attempts.');
                setState('error');
                emit('error');
                return;
              }
              setState('reconnecting');
              window.setTimeout(() => instance.startLoad(), Math.min(8000, 700 * 2 ** retriesRef.current));
              return;
            }
            if (data.type === 'mediaError') {
              instance.recoverMediaError();
              return;
            }
            setErrorMessage('This stream uses a format the browser cannot decode.');
            setState('error');
            emit('error');
          });
          return;
        }

        if (nativeHlsSupported(video)) {
          video.src = payload.source.url;
          setState('live');
          emit('manifest_loaded');
          if (settings.autoplay) {
            video.muted = true;
            void video.play().catch(() => undefined);
          }
          return;
        }

        setErrorMessage('HLS playback is not supported in this browser.');
        setState('error');
        emit('error');
      } catch {
        if (cancelled) return;
        setErrorMessage('The playback session could not be created.');
        setState('error');
        emit('error');
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute('src');
      video.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id, attempt, create]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setPlaying(true);
      setState('live');
      if (!historyRef.current) {
        historyRef.current = true;
        pushHistory(channel.slug);
        emit('first_frame');
      }
    };
    const onPause = () => {
      setPlaying(false);
      setState('paused');
    };
    const onWaiting = () => {
      setState('buffering');
      emit('buffering_start');
    };
    const onPlaying = () => {
      setState('live');
      emit('buffering_end');
    };
    const onVolumeChange = () => {
      setMuted(video.muted);
      setVolume(video.volume);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('volumechange', onVolumeChange);
      emit('stop');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.slug]);

  useEffect(() => {
    const onOffline = () => setState('offline');
    const onOnline = () => setAttempt((current) => current + 1);
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement !== null);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const changeVolume = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(1, Math.max(0, value));
    video.muted = video.volume === 0;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void container.requestFullscreen().catch(() => undefined);
  }, []);

  const togglePictureInPicture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) {
      pushToast({ tone: 'info', title: 'Picture in picture is unavailable in this browser.' });
      return;
    }
    if (document.pictureInPictureElement) void document.exitPictureInPicture().catch(() => undefined);
    else void video.requestPictureInPicture().catch(() => undefined);
  }, [pushToast]);

  const goLive = useCallback(() => {
    const video = videoRef.current;
    const instance = hlsRef.current;
    if (!video) return;
    if (instance && instance.liveSyncPosition !== null) video.currentTime = instance.liveSyncPosition;
    else if (video.seekable.length > 0) video.currentTime = video.seekable.end(video.seekable.length - 1);
    void video.play().catch(() => undefined);
  }, []);

  const selectLevel = useCallback((level: number) => {
    const instance = hlsRef.current;
    if (instance) instance.currentLevel = level;
    setCurrentLevel(level);
    setMenuOpen(false);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const key = event.key.toLowerCase();
      if (key === ' ' || key === 'k') {
        event.preventDefault();
        togglePlay();
      } else if (key === 'm') {
        toggleMute();
      } else if (key === 'f') {
        toggleFullscreen();
      } else if (key === 'l') {
        goLive();
      } else if (key === 'arrowup') {
        event.preventDefault();
        changeVolume((videoRef.current?.volume ?? 0) + 0.1);
      } else if (key === 'arrowdown') {
        event.preventDefault();
        changeVolume((videoRef.current?.volume ?? 0) - 0.1);
      } else if (key === '?') {
        setShortcutsOpen(true);
      }
    },
    [togglePlay, toggleMute, toggleFullscreen, goLive, changeVolume],
  );

  const submitReport = useCallback(
    async (reason: string) => {
      setReportOpen(false);
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ channelId: channel.id, reason }),
        });
        pushToast({ tone: 'success', title: 'Report sent', body: 'Our operations team will review this channel.' });
      } catch {
        pushToast({ tone: 'warning', title: 'Report could not be sent', body: 'Please try again shortly.' });
      }
    },
    [channel.id, pushToast],
  );

  const blocking = state === 'error' || state === 'offline';

  return (
    <div className="player" ref={containerRef} onKeyDown={onKeyDown} tabIndex={0} role="region" aria-label={`${channel.name} player`}>
      <div className="player-stage">
        <video ref={videoRef} playsInline muted={muted} preload="metadata" aria-label={`${channel.name} live stream`} />

        <AnimatePresence>
          {state === 'connecting' || state === 'buffering' || state === 'reconnecting' ? (
            <motion.div
              key="status"
              className="player-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
                <Loader2 size={26} aria-hidden="true" />
                <p role="status" aria-live="polite">
                  {STATE_LABEL[state]}
                </p>
              </div>
            </motion.div>
          ) : null}

          {blocking ? (
            <motion.div
              key="blocked"
              className="player-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div style={{ display: 'grid', gap: 12, justifyItems: 'center', maxWidth: 420 }}>
                {state === 'offline' ? <WifiOff size={26} aria-hidden="true" /> : <ShieldAlert size={26} aria-hidden="true" />}
                <p style={{ fontWeight: 700 }}>{STATE_LABEL[state]}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {state === 'offline' ? 'Reconnect to the network to resume the stream.' : errorMessage}
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setAttempt((current) => current + 1)}>
                  Try again
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!blocking ? (
          <PlayerControls
            playing={playing}
            muted={muted}
            volume={volume}
            fullscreen={fullscreen}
            atLiveEdge={state === 'live'}
            levels={levels}
            currentLevel={currentLevel}
            menuOpen={menuOpen}
            onTogglePlay={togglePlay}
            onToggleMute={toggleMute}
            onVolume={changeVolume}
            onToggleFullscreen={toggleFullscreen}
            onPictureInPicture={togglePictureInPicture}
            onGoLive={goLive}
            onToggleMenu={() => setMenuOpen((current) => !current)}
            onSelectLevel={selectLevel}
            onReport={() => setReportOpen(true)}
          />
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{failed ? 'Player library could not be loaded. Native playback will be used when available.' : notice}</p>
        <button type="button" className="btn btn-quiet" onClick={() => setShortcutsOpen(true)}>
          <Keyboard size={15} aria-hidden="true" />
          <span>Shortcuts</span>
        </button>
      </div>

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} title="Report a stream problem">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Tell us what went wrong so operations can check this channel.</p>
        <div className="chip-row">
          {REPORT_REASONS.map((reason) => (
            <button key={reason.id} type="button" className="chip" onClick={() => void submitReport(reason.id)}>
              {reason.label}
            </button>
          ))}
        </div>
      </Dialog>

      <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts">
        <div className="meta-list">
          <div className="meta-row">
            <span>Play or pause</span>
            <strong className="mono">Space / K</strong>
          </div>
          <div className="meta-row">
            <span>Mute</span>
            <strong className="mono">M</strong>
          </div>
          <div className="meta-row">
            <span>Fullscreen</span>
            <strong className="mono">F</strong>
          </div>
          <div className="meta-row">
            <span>Volume</span>
            <strong className="mono">Up / Down</strong>
          </div>
          <div className="meta-row">
            <span>Live edge</span>
            <strong className="mono">L</strong>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
