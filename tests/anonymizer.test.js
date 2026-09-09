const assert = require('node:assert/strict');
const test = require('node:test');

const { scan } = require('../src/core/scanner');
const { anonymize } = require('../src/core/anonymizer');
const { anonymizedPath } = require('../src/commands/anonymize');

test('anonymizer uses stable pseudonymous values', () => {
  const input = [
    'wahyu@example.com',
    'budi@example.com',
    'wahyu@example.com',
    '081234567890',
    '192.168.1.20'
  ].join('\n');
  const result = anonymize(input);

  assert.equal(result.output.match(/user001@example\.test/g).length, 2);
  assert.match(result.output, /user002@example\.test/);
  assert.match(result.output, /080000000001/);
  assert.match(result.output, /192\.0\.2\.1/);
});

test('anonymized content scans clean', () => {
  const input = [
    'email=wahyu@example.com',
    'phone=081234567890',
    'ip=192.168.1.20',
    'auth=Bearer abcdefghijklmnopqrstuvwxyz1234567890',
    'db=postgresql://admin:supersecret@localhost:5432/appdb',
    'API_KEY=abc123456789'
  ].join('\n');

  assert.equal(scan(anonymize(input).output).length, 0);
});

test('anonymized output path keeps extension and handles dotfiles', () => {
  assert.equal(anonymizedPath('users.json'), 'users.anonymized.json');
  assert.equal(anonymizedPath('production.log'), 'production.anonymized.log');
  assert.equal(anonymizedPath('.env'), '.env.anonymized');
});
