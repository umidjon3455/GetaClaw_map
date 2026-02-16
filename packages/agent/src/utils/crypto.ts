import { randomBytes, createHash } from 'node:crypto';
import selfsigned from 'selfsigned';

export interface TlsCert {
  cert: string;
  key: string;
  fingerprint: string;
}

export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateSessionToken(): string {
  return randomBytes(48).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateTlsCert(pairingToken: string): TlsCert {
  const attrs = [{ name: 'commonName', value: 'getaclaw-agent' }];
  const options = {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256' as const,
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
        ],
      },
    ],
  };

  const pems = selfsigned.generate(attrs, options);

  const fingerprint = createHash('sha256')
    .update(pems.cert)
    .digest('hex')
    .match(/.{2}/g)!
    .join(':');

  return {
    cert: pems.cert,
    key: pems.private,
    fingerprint,
  };
}

export function computeCertFingerprint(certPem: string): string {
  return createHash('sha256')
    .update(certPem)
    .digest('hex')
    .match(/.{2}/g)!
    .join(':');
}
