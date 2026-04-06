import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const certDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\//, '');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Check if certs already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✅ SSL certificates already exist');
  process.exit(0);
}

// Try using openssl if available
const cmd = process.platform === 'win32' ? 'openssl' : 'openssl';
const args = [
  'req',
  '-x509',
  '-newkey', 'rsa:2048',
  '-keyout', keyPath,
  '-out', certPath,
  '-days', '365',
  '-nodes',
  '-subj', '/CN=192.168.29.62'
];

const proc = spawn(cmd, args, { stdio: 'pipe' });

proc.on('close', (code) => {
  if (code === 0) {
    console.log('✅ SSL certificates generated successfully');
  } else {
    console.log('Note: Could not generate certificates with OpenSSL');
    console.log('Creating dummy certificates...');
    // Create basic PEM files (self-signed dummy for dev only)
    const dummyKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDEK7E0xX2QbhW2
TVsKqRQj6GgXXGVTg2HvZDLKZPzT5V7q5GX3VGnD7GJK1P1wPoLuXfJ3QvQZJ5wg
XyQYp8oy7vJKqsKdQ5Q5xZ5ZLvVq5Z3rFJq5pZ5KzQ3vQvStQ3Z9YxFyQwOzGVdP
5xFQ5xQ5Q5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ
5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ
5xQ5xQ5xQ5AgMBAAECggEAQwJE9J3V4F1Q5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ5xQ
-----END PRIVATE KEY-----`;
    
    const dummyCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJ5Q5xQ5xQ5xMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
-----END CERTIFICATE-----`;
    
    fs.writeFileSync(keyPath, dummyKey);
    fs.writeFileSync(certPath, dummyCert);
    console.log('⚠️  Dummy certificates created for local testing');
  }
});
