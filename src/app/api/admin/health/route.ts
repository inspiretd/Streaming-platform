import type { NextRequest } from 'next/server';
import { getChannels } from '@/server/catalog';
import { summarizeHealth } from '@/server/health';
import { fail, isAdminAuthorized, newRequestId, ok } from '@/server/http';
import { auditLog, importHistory, reportList } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestId = newRequestId();
  if (!isAdminAuthorized(request)) {
    return fail('forbidden', 'Admin token required.', requestId, 403);
  }
  return ok(
    {
      health: summarizeHealth(getChannels()),
      imports: importHistory(),
      audit: auditLog(),
      reports: reportList(),
    },
    requestId,
  );
}
