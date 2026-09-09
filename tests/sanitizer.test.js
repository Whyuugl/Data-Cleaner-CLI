const assert = require('node:assert/strict');
const test = require('node:test');

const { scan } = require('../src/core/scanner');
const { sanitize } = require('../src/core/sanitizer');
const { sanitizedPath } = require('../src/commands/scrub');

test('secret detector catches JSON and env assignments', () => {
  assert.equal(scan('{"api_key":"abc123456789"}')[0].type, 'secret');
  assert.equal(scan('API_KEY=abc123456789')[0].type, 'secret');
});

test('sanitizer replaces from right to left and preserves JSON syntax', () => {
  const input = '{"api_key":"abc123456789","backup":"abc123456789","email":"wahyu@example.com"}';
  const result = sanitize(input);
  const parsed = JSON.parse(result.output);

  assert.equal(parsed.api_key, '[REDACTED_SECRET]');
  assert.equal(parsed.email, 'wa***@example.com');
  assert.equal(parsed.backup, 'abc123456789');
});

test('sanitized content scans clean for supported sample types', () => {
  const input = [
    'email=wahyu@example.com',
    'phone=081234567890',
    'ip=192.168.1.20',
    'auth=Bearer abcdefghijklmnopqrstuvwxyz1234567890',
    'jwt=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abcdefghijk123456789',
    'db=postgresql://admin:supersecret@localhost:5432/appdb',
    'API_KEY=abc123456789'
  ].join('\n');

  assert.equal(scan(sanitize(input).output).length, 0);
});

test('sanitized output path keeps extension and handles dotfiles', () => {
  assert.equal(sanitizedPath('users.json'), 'users.sanitized.json');
  assert.equal(sanitizedPath('production.log'), 'production.sanitized.log');
  assert.equal(sanitizedPath('.env'), '.env.sanitized');
});
