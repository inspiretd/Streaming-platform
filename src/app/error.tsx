'use client';

import { useEffect } from 'react';
import { ErrorPanel } from '@/components/StatusPanel';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the digest only; never log stream URLs or credentials.
    if (error.digest) {
      // eslint-disable-next-line no-console
      console.error(`render_error:${error.digest}`);
    }
  }, [error]);

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <ErrorPanel
        title="Something interrupted the broadcast"
        description="An unexpected error occurred while rendering this page. You can retry immediately."
        action={
          <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
            Try again
          </button>
        }
      />
    </div>
  );
}
