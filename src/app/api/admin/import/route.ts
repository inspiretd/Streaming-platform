import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { MAX_PLAYLIST_BYTES, buildImportPreview } from '@/lib/m3u';
import { inspectStreamUrl } from '@/lib/url-safety';
import { previewToChannel } from '@/server/import';
import { clientKey, fail, isAdminAuthorized, newRequestId, ok, rateLimit } from '@/server/http';
import { addImportedChannels, recordAudit, recordImport, rollbackImports } from '@/server/store';

export const dynamic = 'force-dynamic';

const schema = z.object({
  mode: z.enum(['preview', 'dry-run', 'execute', 'rollback']),
  content: z.string().max(MAX_PLAYLIST_BYTES).optional(),
  sourceUrl: z.string().url().max(2048).optional(),
  allowHttp: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  if (!isAdminAuthorized(request)) {
    return fail('forbidden', 'Admin token required.', requestId, 403);
  }
  if (!rateLimit(clientKey(request, 'import'), 20)) {
    return fail('rate_limited', 'Too many import requests.', requestId, 429);
  }

  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return fail('invalid_body', 'Import payload is invalid.', requestId, 422);
  }

  const { mode, allowHttp } = parsed.data;

  if (mode === 'rollback') {
    const removed = rollbackImports();
    recordAudit('provider_manager', 'import.rollback', `removed=${removed}`);
    return ok({ mode, removed }, requestId);
  }

  let content = parsed.data.content ?? '';

  if (content.length === 0 && parsed.data.sourceUrl) {
    const verdict = inspectStreamUrl(parsed.data.sourceUrl, { allowHttp });
    if (!verdict.safe) {
      return fail('unsafe_source', `Remote playlist rejected: ${verdict.reason}.`, requestId, 422);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(verdict.url, { signal: controller.signal, redirect: 'follow' });
      if (!response.ok) {
        return fail('source_unreachable', 'Remote playlist could not be fetched.', requestId, 502);
      }
      content = (await response.text()).slice(0, MAX_PLAYLIST_BYTES);
    } catch {
      return fail('source_unreachable', 'Remote playlist could not be fetched.', requestId, 502);
    } finally {
      clearTimeout(timer);
    }
  }

  if (content.trim().length === 0) {
    return fail('empty_playlist', 'Provide playlist content or an authorized source URL.', requestId, 422);
  }

  const preview = buildImportPreview(content, { allowHttp });

  if (mode === 'preview' || mode === 'dry-run') {
    recordImport({
      mode,
      accepted: preview.totals.accepted,
      rejected: preview.totals.rejectedAdult + preview.totals.rejectedInvalid,
      duplicates: preview.totals.duplicates,
      status: 'completed',
    });
    recordAudit('provider_manager', `import.${mode}`, `accepted=${preview.totals.accepted}`);
    return ok({ mode, preview }, requestId);
  }

  const channels = preview.channels.map(previewToChannel);
  const added = addImportedChannels(channels);
  recordImport({
    mode,
    accepted: added,
    rejected: preview.totals.rejectedAdult + preview.totals.rejectedInvalid,
    duplicates: preview.totals.duplicates,
    status: 'completed',
  });
  recordAudit('provider_manager', 'import.execute', `added=${added}`);

  return ok({ mode, added, totals: preview.totals }, requestId, 201);
}
