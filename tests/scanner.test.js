const assert = require('node:assert/strict');
const test = require('node:test');

const { scan } = require('../src/core/scanner');

test('detects MVP sensitive data types', () => {
  const detections = scan([
    'wahyu@example.com',
    '081234567890',
    '192.168.1.1',
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abcdefghijk123456789',
    'Bearer abcdefghijklmnopqrstuvwxyz1234567890',
    'postgresql://admin:supersecret@localhost:5432/appdb',
    'API_KEY=abc123456789'
  ].join('\n'));

  assert.deepEqual(
    detections.map(detection => detection.type),
    ['email', 'phone', 'ipv4', 'jwt', 'bearer_token', 'database_url', 'secret']
  );
});

test('does not detect invalid ipv4', () => {
  assert.equal(scan('999.999.999.999').length, 0);
});

test('bearer jwt is detected once as bearer_token', () => {
  const detections = scan(
    'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abcdefghijk123456789'
  );

  assert.equal(detections.length, 1);
  assert.equal(detections[0].type, 'bearer_token');
});

test('scanner adds line numbers', () => {
  const detections = scan('clean\nwahyu@example.com');

  assert.equal(detections[0].line, 2);
});
