'use client';

import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Notice, SuccessNote } from '@/components/StatusPanel';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'unconfigured';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: { code: string; message: string } };
      if (payload.ok) {
        setStatus('sent');
        return;
      }
      if (payload.error && payload.error.code === 'auth_not_configured') {
        setStatus('unconfigured');
        setMessage(payload.error.message);
        return;
      }
      setStatus('error');
      setMessage(payload.error ? payload.error.message : 'The magic link could not be sent.');
    } catch {
      setStatus('error');
      setMessage('The magic link could not be sent. Check your connection and try again.');
    }
  };

  return (
    <form className="panel" style={{ display: 'grid', gap: 14, marginTop: 22 }} onSubmit={submit}>
      <label htmlFor="email" className="filter-label">
        Email address
      </label>
      <input
        id="email"
        className="field"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />

      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? <Loader2 size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
        <span>{status === 'sending' ? 'Sending link' : 'Send magic link'}</span>
      </button>

      {status === 'sent' ? <SuccessNote>Check your inbox. The sign in link expires in 15 minutes.</SuccessNote> : null}
      {status === 'error' ? <Notice tone="danger">{message}</Notice> : null}
      {status === 'unconfigured' ? <Notice tone="warning">{message}</Notice> : null}

      <p className="feature-text">
        Guest favorites and history stay on this device. After sign in they can be migrated to your account with row level
        security enforced per user.
      </p>
    </form>
  );
}
