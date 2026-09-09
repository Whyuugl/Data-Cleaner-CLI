const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { blockingDetections, scanFiles } = require('../src/commands/guard');

test('guard blocks high and critical findings only', () => {
  const detections = [
    { severity: 'medium' },
    { severity: 'high' },
    { severity: 'critical' }
  ];

  assert.equal(blockingDetections(detections).length, 2);
});

test('guard scans files without exposing raw values in result shape', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));
  const input = path.join(dir, 'input.env');

  fs.writeFileSync(input, 'API_KEY=abc123456789', 'utf8');

  const { results } = scanFiles([input]);
  const [result] = results;

  assert.equal(result.blocking.length, 1);
  assert.equal(result.blocking[0].type, 'secret');
  assert.match(result.blocking[0].preview, /\[REDACTED_SECRET\]/);
});
