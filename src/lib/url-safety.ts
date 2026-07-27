export type UrlVerdict = { safe: true; url: string; host: string } | { safe: false; reason: UrlRejectReason };

export type UrlRejectReason =
  | 'invalid_url'
  | 'unsupported_scheme'
  | 'insecure_scheme'
  | 'private_host'
  | 'credentials_in_url'
  | 'blocked_port';

const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443']);

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
  /^\[?fc00:/i,
  /^\[?fd[0-9a-f]{2}:/i,
  /\.local$/i,
  /\.internal$/i,
];

export function isPrivateHost(host: string): boolean {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host));
}

export function inspectStreamUrl(raw: string, options: { allowHttp?: boolean } = {}): UrlVerdict {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { safe: false, reason: 'invalid_url' };
  }
  if (parsed.username.length > 0 || parsed.password.length > 0) {
    return { safe: false, reason: 'credentials_in_url' };
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { safe: false, reason: 'unsupported_scheme' };
  }
  if (parsed.protocol === 'http:' && options.allowHttp !== true) {
    return { safe: false, reason: 'insecure_scheme' };
  }
  if (!ALLOWED_PORTS.has(parsed.port)) {
    return { safe: false, reason: 'blocked_port' };
  }
  if (isPrivateHost(parsed.hostname)) {
    return { safe: false, reason: 'private_host' };
  }
  return { safe: true, url: parsed.toString(), host: parsed.hostname };
}

export function redactUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.hostname}/***redacted***`;
  } catch {
    return '***redacted***';
  }
}

const SECRET_PATTERNS = [
  /(token|access[_-]?key|apikey|api[_-]?key|password|passwd|session|cookie|auth)=([^&\s]+)/gi,
  /(Bearer)\s+[A-Za-z0-9._~+/-]+=*/gi,
];

export function redactSecrets(value: string): string {
  let output = value;
  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, (_match, key: string) => `${key}=***redacted***`);
  }
  return output;
}

export function fingerprintUrl(raw: string): string {
  const normalized = raw.trim().toLowerCase().replace(/\?.*$/, '');
  let hash = 5381;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(index)) >>> 0;
  }
  return `fp_${hash.toString(16)}`;
}
