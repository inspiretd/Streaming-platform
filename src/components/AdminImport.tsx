'use client';
import { useState } from 'react';
import { CheckCircle2, FileUp, ShieldCheck } from 'lucide-react';
import { StatusPanel } from './StatusPanel';

export function AdminImport() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [summary, setSummary] = useState('');
  async function preview() {
    setStatus('loading');
    try {
      const response = await fetch('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: value }) });
      if (!response.ok) throw new Error('preview failed');
      const data = (await response.json()) as { total: number; blocked: number };
      setSummary(`${data.total} safe entries ready for review, ${data.blocked} blocked.`);
      setStatus('success');
    } catch { setStatus('error'); }
  }
  return <section className="admin-import"><div className="admin-import-head"><div><p className="eyebrow">Provider manager</p><h2>Import authorized M3U</h2><p>Preview first. Publish only after rights are confirmed.</p></div><ShieldCheck size={25} color="var(--accent)" /></div><textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="#EXTM3U\n#EXTINF:0 group-title=\"News\",Channel name\nhttps://authorized.example/live.m3u8" aria-label="M3U playlist text" /><div className="admin-import-actions"><button className="secondary-button" onClick={() => setValue('')}><FileUp size={16} /> Clear</button><button className="primary-button" onClick={preview} disabled={!value || status === 'loading'}><CheckCircle2 size={16} /> {status === 'loading' ? 'Checking…' : 'Preview import'}</button></div>{status === 'success' && <StatusPanel kind="success" title="Preview complete" detail={summary} />}{status === 'error' && <StatusPanel kind="error" title="Preview failed" detail="Check the file format and try again." />}</section>;
}
