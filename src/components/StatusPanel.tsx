type StatusPanelProps = { kind: 'loading' | 'empty' | 'error' | 'success'; title: string; detail: string };

export function StatusPanel({ kind, title, detail }: StatusPanelProps) {
  return <div className={`status-panel status-${kind}`} role={kind === 'error' ? 'alert' : 'status'}><span className="status-dot" /><div><strong>{title}</strong><p>{detail}</p></div></div>;
}
