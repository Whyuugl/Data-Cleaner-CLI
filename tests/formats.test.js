const assert = require('node:assert/strict');
const test = require('node:test');

const { scan } = require('../src/core/scanner');
const { sanitize } = require('../src/core/sanitizer');

const samples = {
  env: [
    'API_KEY=abc123456789',
    'DATABASE_URL=postgresql://admin:supersecret@localhost:5432/appdb'
  ].join('\n'),
  csv: [
    'name,email,phone',
    'Wahyu,wahyu@example.com,081234567890'
  ].join('\n'),
  jsonl: [
    '{"email":"wahyu@example.com"}',
    '{"authorization":"Bearer abcdefghijklmnopqrstuvwxyz1234567890"}'
  ].join('\n'),
  log: '2026-09-08 login user=wahyu@example.com ip=192.168.1.20',
  txt: 'Call 081234567890 or use token eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abcdefghijk123456789',
  yaml: [
    'api_key: abc123456789',
    'database: mysql://root:secret@localhost/app'
  ].join('\n')
};

test('raw scanner supports common developer text formats', () => {
  for (const [format, input] of Object.entries(samples)) {
    assert.ok(scan(input).length > 0, `${format} should have detections`);
  }
});

test('scrubbed common developer text formats scan clean', () => {
  for (const [format, input] of Object.entries(samples)) {
    assert.equal(scan(sanitize(input).output).length, 0, format);
  }
});
