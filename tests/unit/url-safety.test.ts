import { describe, expect, it } from 'vitest';
import { fingerprintUrl, inspectStreamUrl, isPrivateHost, redactSecrets, redactUrl } from '@/lib/url-safety';

describe('SSRF protection', () => {
  it('accepts public https sources', () => {
    const verdict = inspectStreamUrl('https://cdn.example.com/live/index.m3u8');
    expect(verdict.safe).toBe(true);
  });

  it('rejects http by default', () => {
    const verdict = inspectStreamUrl('http://cdn.example.com/live/index.m3u8');
    expect(verdict).toEqual({ safe: false, reason: 'insecure_scheme' });
  });

  it('rejects private and loopback hosts', () => {
    expect(isPrivateHost('127.0.0.1')).toBe(true);
    expect(isPrivateHost('10.0.0.8')).toBe(true);
    expect(isPrivateHost('172.16.4.1')).toBe(true);
    expect(isPrivateHost('cdn.example.com')).toBe(false);
    expect(inspectStreamUrl('https://localhost/index.m3u8')).toEqual({ safe: false, reason: 'private_host' });
  });

  it('rejects embedded credentials and odd ports', () => {
    expect(inspectStreamUrl('https://user:pass@cdn.example.com/a.m3u8')).toEqual({
      safe: false,
      reason: 'credentials_in_url',
    });
    expect(inspectStreamUrl('https://cdn.example.com:9999/a.m3u8')).toEqual({ safe: false, reason: 'blocked_port' });
  });

  it('rejects unsupported schemes and malformed input', () => {
    expect(inspectStreamUrl('rtmp://cdn.example.com/a')).toEqual({ safe: false, reason: 'unsupported_scheme' });
    expect(inspectStreamUrl('nope')).toEqual({ safe: false, reason: 'invalid_url' });
  });
});

describe('redaction', () => {
  it('hides the path and query of a stream url', () => {
    expect(redactUrl('https://cdn.example.com/secret/path.m3u8?token=abc')).toBe('https://cdn.example.com/***redacted***');
  });

  it('redacts credential shaped values', () => {
    expect(redactSecrets('url?token=abc123&x=1')).toContain('token=***redacted***');
    expect(redactSecrets('Authorization: Bearer abc.def.ghi')).toContain('redacted');
  });

  it('fingerprints ignore query strings', () => {
    expect(fingerprintUrl('https://a.example.com/x.m3u8?t=1')).toBe(fingerprintUrl('https://a.example.com/x.m3u8?t=2'));
  });
});
