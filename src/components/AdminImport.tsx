'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { FileUp, Loader2, PlayCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import type { ImportPreview } from '@/lib/m3u';
import { MAX_PLAYLIST_BYTES } from '@/lib/m3u';
import { Notice, SuccessNote } from '@/components/StatusPanel';
import { useToast } from '@/components/ui/Toast';

type Mode = 'preview' | 'dry-run' | 'execute' | 'rollback';

const SAMPLE = [
  '#EXTM3U',
  '#EXTINF:-1 tvg-id="uz24.tomosha" tvg-name="Ozbekiston 24" group-title="Узбекистан",Ozbekiston 24 HD',
  'https://demo.example.com/uz24/index.m3u8',
  '#EXTINF:-1 tvg-id="uz24.tomosha" group-title="Узбекистан",Ozbekiston 24 HD',
  'https://demo.example.com/uz24/index.m3u8',
  '#EXTINF:-1 group-title="Uzbekistan",Yoshlar FHD',
  'https://demo.example.com/yoshlar/index.m3u8',
  '#EXTINF:-1 group-title="Sport",Arena Sport UHD +2',
  'https://demo.example.com/arena/index.m3u8',
  '#EXTINF:-1 group-title="Взрослые",Blocked Channel',
  'https://demo.example.com/blocked/index.m3u8',
  '#EXTINF:-1 group-title="Local",Broken Source',
  'http://192.168.1.10/private/index.m3u8',
].join('\n');

export function AdminImport() {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState<Mode | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { push } = useToast();

  const run = async (mode: Mode) => {
    setBusy(mode);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, content: mode === 'rollback' ? undefined : content }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { preview?: ImportPreview; added?: number; removed?: number };
        error?: { message: string };
      };

      if (!payload.ok || !payload.data) {
        setError(payload.error ? payload.error.message : 'The import request failed.');
        return;
      }

      if (payload.data.preview) setPreview(payload.data.preview);
      if (mode === 'execute') {
        setSuccess(`${payload.data.added ?? 0} channels imported as drafts. Publish them after rights confirmation.`);
        push({ tone: 'success', title: 'Import completed', body: `${payload.data.added ?? 0} draft channels added.` });
      }
      if (mode === 'rollback') {
        setSuccess(`${payload.data.removed ?? 0} imported channels rolled back.`);
        push({ tone: 'success', title: 'Rollback completed' });
      }
      if (mode === 'dry-run') {
        push({ tone: 'info', title: 'Dry run finished', body: 'No catalog changes were written.' });
      }
    } catch {
      setError('The import request failed. Check the console network tab for the request id.');
    } finally {
      setBusy(null);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_PLAYLIST_BYTES) {
      setError('That playlist is larger than the 5 MB safety limit.');
      return;
    }
    setContent(await file.text());
    setError('');
  };

  return (
    <div style={{ display: 'grid', gap: 18, marginTop: 22 }}>
      <div className="panel" style={{ display: 'grid', gap: 14 }}>
        <Notice tone="warning">
          Playlists are processed in memory only. Nothing is written to the repository and stream URLs are redacted in every
          response, log and audit entry.
        </Notice>

        <label className="filter-label" htmlFor="playlist">
          Playlist content
        </label>
        <textarea
          id="playlist"
          className="field"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="#EXTM3U"
          spellCheck={false}
        />

        <div className="pill-row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
            <FileUp size={15} aria-hidden="true" />
            <span>Upload file</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".m3u,.m3u8,text/plain"
            className="visually-hidden"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          <button type="button" className="btn btn-quiet" onClick={() => setContent(SAMPLE)}>
            Load safe sample
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => { setContent(''); setPreview(null); }}>
            Clear
          </button>
        </div>

        <div className="pill-row">
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null || content.trim().length === 0} onClick={() => void run('preview')}>
            {busy === 'preview' ? <Loader2 size={15} aria-hidden="true" /> : <ShieldCheck size={15} aria-hidden="true" />}
            <span>Preview</span>
          </button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null || content.trim().length === 0} onClick={() => void run('dry-run')}>
            <span>Dry run</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={busy !== null || preview === null} onClick={() => void run('execute')}>
            <PlayCircle size={15} aria-hidden="true" />
            <span>Execute import</span>
          </button>
          <button type="button" className="btn btn-danger btn-sm" disabled={busy !== null} onClick={() => void run('rollback')}>
            <RotateCcw size={15} aria-hidden="true" />
            <span>Rollback</span>
          </button>
        </div>

        {error.length > 0 ? <Notice tone="danger">{error}</Notice> : null}
        {success.length > 0 ? <SuccessNote>{success}</SuccessNote> : null}
      </div>

      {preview ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} style={{ display: 'grid', gap: 16 }}>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-value">{preview.totals.accepted}</span>
              <span className="stat-label">Accepted entries</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{preview.totals.channels}</span>
              <span className="stat-label">Unique channels</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{preview.totals.duplicates}</span>
              <span className="stat-label">Duplicates</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{preview.totals.rejectedAdult}</span>
              <span className="stat-label">Adult rejected</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{preview.totals.rejectedInvalid}</span>
              <span className="stat-label">Invalid or unsafe</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{preview.totals.uzbek}</span>
              <span className="stat-label">Mapped to UZ</span>
            </div>
          </div>

          {preview.warnings.map((warning) => (
            <Notice tone="warning" key={warning}>
              {warning}
            </Notice>
          ))}

          <div className="table-wrap">
            <table className="table">
              <caption className="visually-hidden">Channels detected in the playlist</caption>
              <thead>
                <tr>
                  <th scope="col">Channel</th>
                  <th scope="col">Group</th>
                  <th scope="col">Country</th>
                  <th scope="col">Variants</th>
                  <th scope="col">Host</th>
                </tr>
              </thead>
              <tbody>
                {preview.channels.slice(0, 60).map((row) => (
                  <tr key={row.key}>
                    <td style={{ color: 'var(--text-primary)' }}>{row.baseName}</td>
                    <td>{row.group.length > 0 ? row.group : 'Ungrouped'}</td>
                    <td>{row.country}</td>
                    <td>{row.variants.map((variant) => `${variant.quality} ${variant.timeshift}`).join(', ')}</td>
                    <td className="mono">{row.variants[0].host}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.rejected.length > 0 ? (
            <div className="table-wrap">
              <table className="table">
                <caption className="visually-hidden">Rejected playlist entries</caption>
                <thead>
                  <tr>
                    <th scope="col">Entry</th>
                    <th scope="col">Group</th>
                    <th scope="col">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rejected.slice(0, 40).map((row) => (
                    <tr key={`${row.index}-${row.reason}`}>
                      <td>{row.name}</td>
                      <td>{row.group.length > 0 ? row.group : 'Ungrouped'}</td>
                      <td>{row.reason.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}
