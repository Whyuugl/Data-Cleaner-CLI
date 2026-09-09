const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('package exposes expected CLI bins and API entry', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );
  const api = require('..');

  assert.equal(pkg.main, 'index.js');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.bin.devsanitize, './bin/dev-sanitize.js');
  assert.equal(pkg.bin['dev-sanitize'], './bin/dev-sanitize.js');
  assert.equal(typeof api.scan, 'function');
  assert.equal(typeof api.sanitize, 'function');
  assert.equal(typeof api.anonymize, 'function');
});
