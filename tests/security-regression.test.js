const assert = require('node:assert/strict');
const test = require('node:test');

const { scan } = require('../src/core/scanner');
const { sanitize } = require('../src/core/sanitizer');

test('scanner handles CRLF, repeated values, and overlaps safely', () => {
  const input = [
    'API_KEY=abc123456789',
    'backup=abc123456789',
    'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abcdefghijk123456789',
    'DATABASE_URL=postgresql://admin:p%40ssword@localhost:5432/appdb'
  ].join('\r\n');

  const detections = scan(input);

  assert.equal(detections.filter(detection => detection.type === 'secret').length, 1);
  assert.equal(detections.filter(detection => detection.type === 'bearer_token').length, 1);
  assert.equal(detections.filter(detection => detection.type === 'jwt').length, 0);
  assert.equal(scan(sanitize(input).output).length, 0);
});

test('scanner ignores common non-secret identifiers without context', () => {
  const input = [
    'id=550e8400-e29b-41d4-a716-446655440000',
    'sha=2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    'integrity=sha512-abcdef1234567890abcdef1234567890',
    'request_id=req_abc123456789'
  ].join('\n');

  assert.equal(scan(input).length, 0);
});

test('malformed jwt and invalid ipv4 stay clean', () => {
  assert.equal(scan('token=eyJnot.a.jwt').length, 0);
  assert.equal(scan('ip=999.999.999.999').length, 0);
});
