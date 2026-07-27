'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="chip" data-active={active} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <div className="switch-row">
      <span id={`switch-${label.replace(/\s+/g, '-').toLowerCase()}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`switch-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="switch"
        data-on={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

export type TabItem = { id: string; label: string };

export function Tabs({ items, active, onChange, layoutId = 'tab-underline' }: { items: TabItem[]; active: string; onChange: (id: string) => void; layoutId?: string }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === active}
          className="tab"
          data-active={item.id === active}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          {item.id === active ? <motion.span layoutId={layoutId} className="tab-underline" transition={{ type: 'spring', stiffness: 420, damping: 34 }} /> : null}
        </button>
      ))}
    </div>
  );
}
