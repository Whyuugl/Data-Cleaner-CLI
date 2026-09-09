const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { execFileSync, spawnSync } = require('node:child_process');

const cli = path.join(__dirname, '..', 'bin', 'dev-sanitize.js');
const cwd = path.join(__dirname, '..');

function run(args) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8'
  });
}

function runFail(args) {
  try {
    run(args);
  } catch (error) {
    return error.stdout;
  }

  throw new Error('Command unexpectedly passed');
}

function runWithStatus(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8'
  });
}

test('scan --json omits raw sensitive values', () => {
  const output = run(['scan', 'examples/sample.env', '--json']);
  const result = JSON.parse(output);

  assert.equal(result.count, 3);
  assert.equal(result.detections[0].value, undefined);
  assert.match(result.detections[0].preview, /\[REDACTED_SECRET\]/);
  assert.doesNotMatch(output, /abc123456789/);
});

test('scan --quiet prints compact output', () => {
  assert.match(
    run(['scan', 'examples/sample.env', '--quiet']),
    /^3 sensitive value\(s\) detected\./
  );
});

test('scrub --output writes custom output path', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));
  const input = path.join(dir, 'input.env');
  const output = path.join(dir, 'safe.env');

  fs.writeFileSync(input, 'API_KEY=abc123456789', 'utf8');
  run(['scrub', input, '--output', output]);

  assert.equal(fs.readFileSync(input, 'utf8'), 'API_KEY=abc123456789');
  assert.equal(fs.readFileSync(output, 'utf8'), 'API_KEY=[REDACTED_SECRET]');
});

test('scrub --dry-run does not write output file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));
  const input = path.join(dir, 'input.env');

  fs.writeFileSync(input, 'API_KEY=abc123456789', 'utf8');
  run(['scrub', input, '--dry-run']);

  assert.equal(fs.existsSync(path.join(dir, 'input.sanitized.env')), false);
});

test('guard blocks high or critical findings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));
  const input = path.join(dir, 'input.env');

  fs.writeFileSync(input, 'API_KEY=abc123456789', 'utf8');

  const output = runFail(['guard', input]);

  assert.match(output, /Git guard blocked/);
  assert.doesNotMatch(output, /abc123456789/);
});

test('scan --ci exits 0 when clean', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));
  const input = path.join(dir, 'clean.env');

  fs.writeFileSync(input, 'API_KEY=[REDACTED_SECRET]', 'utf8');

  const result = runWithStatus(['scan', input, '--ci', '--quiet']);

  assert.equal(result.status, 0);
});

test('scan --ci exits 1 when sensitive data is detected', () => {
  const result = runWithStatus(['scan', 'examples/sample.env', '--ci', '--quiet']);

  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout, /abc123456789/);
});

test('scan --ci exits 2 on file errors', () => {
  const result = runWithStatus(['scan', 'examples/missing.env', '--ci', '--quiet']);

  assert.equal(result.status, 2);
});

test('scan directory respects generated-file skips in ci mode', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));

  fs.writeFileSync(path.join(dir, 'sample.sanitized.env'), 'API_KEY=abc123456789', 'utf8');

  const result = runWithStatus(['scan', dir, '--ci', '--quiet']);

  assert.equal(result.status, 0);
});

test('default scan output does not print raw critical secrets', () => {
  const output = run(['scan', 'examples/sample.env']);

  assert.doesNotMatch(output, /abc123456789/);
  assert.doesNotMatch(output, /supersecret/);
});
