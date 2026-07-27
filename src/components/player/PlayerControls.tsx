'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  Flag,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Radio,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { HlsLevel } from '@/hooks/useHls';

export type PlayerControlsProps = {
  playing: boolean;
  muted: boolean;
  volume: number;
  fullscreen: boolean;
  atLiveEdge: boolean;
  levels: HlsLevel[];
  currentLevel: number;
  menuOpen: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolume: (value: number) => void;
  onToggleFullscreen: () => void;
  onPictureInPicture: () => void;
  onGoLive: () => void;
  onToggleMenu: () => void;
  onSelectLevel: (level: number) => void;
  onReport: () => void;
};

export function PlayerControls(props: PlayerControlsProps) {
  return (
    <motion.div
      className="player-controls"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <div className="control-row">
        <button type="button" className="control-btn" onClick={props.onTogglePlay} aria-label={props.playing ? 'Pause' : 'Play'}>
          {props.playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
        </button>

        <button type="button" className="control-btn" onClick={props.onToggleMute} aria-label={props.muted ? 'Unmute' : 'Mute'}>
          {props.muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        </button>

        <input
          className="volume"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={props.muted ? 0 : props.volume}
          onChange={(event) => props.onVolume(Number(event.target.value))}
          aria-label="Volume"
        />

        <button
          type="button"
          className="live-pill"
          onClick={props.onGoLive}
          aria-label={props.atLiveEdge ? 'Playing at live edge' : 'Jump to live edge'}
        >
          <Radio size={13} aria-hidden="true" />
          <span style={{ color: props.atLiveEdge ? 'var(--accent)' : 'var(--text-secondary)' }}>LIVE</span>
        </button>

        <span className="control-spacer" />

        <button type="button" className="control-btn" onClick={props.onReport} aria-label="Report a problem with this stream">
          <Flag size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="control-btn"
          data-active={props.menuOpen}
          onClick={props.onToggleMenu}
          aria-label="Playback settings"
          aria-expanded={props.menuOpen}
        >
          <Settings size={17} aria-hidden="true" />
        </button>

        <button type="button" className="control-btn" onClick={props.onPictureInPicture} aria-label="Picture in picture">
          <PictureInPicture2 size={17} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="control-btn"
          onClick={props.onToggleFullscreen}
          aria-label={props.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {props.fullscreen ? <Minimize size={17} aria-hidden="true" /> : <Maximize size={17} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {props.menuOpen ? (
          <motion.div
            className="player-menu"
            role="menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.14 }}
          >
            <button type="button" role="menuitemradio" aria-checked={props.currentLevel === -1} onClick={() => props.onSelectLevel(-1)}>
              Auto quality
            </button>
            {props.levels.map((level, index) => (
              <button
                key={`${level.height}-${level.bitrate}`}
                type="button"
                role="menuitemradio"
                aria-checked={props.currentLevel === index}
                onClick={() => props.onSelectLevel(index)}
              >
                {level.height > 0 ? `${level.height}p` : `${Math.round(level.bitrate / 1000)} kbps`}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
