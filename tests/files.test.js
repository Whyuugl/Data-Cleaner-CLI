const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { collectFiles, ignored, MAX_FILE_BYTES } = require('../src/core/files');

test('collectFiles scans directories recursively and skips default ignored paths', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));

  fs.mkdirSync(path.join(dir, 'src'));
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.mkdirSync(path.join(dir, '.git'));
  fs.writeFileSync(path.join(dir, 'src', 'app.env'), 'API_KEY=abc123456789');
  fs.writeFileSync(path.join(dir, 'node_modules', 'dep.env'), 'API_KEY=abc123456789');
  fs.writeFileSync(path.join(dir, '.git', 'config'), 'API_KEY=abc123456789');
  fs.writeFileSync(path.join(dir, 'safe.sanitized.env'), 'API_KEY=[REDACTED_SECRET]');

  const result = collectFiles(['.'], { cwd: dir });

  assert.deepEqual(result.files, ['src/app.env']);
  assert.equal(result.skipped.filter(item => item.reason === 'ignored').length, 3);
});

test('.devsanitizeignore supports directory and glob patterns', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));

  fs.mkdirSync(path.join(dir, 'fixtures'));
  fs.mkdirSync(path.join(dir, 'fixtures', 'public'));
  fs.writeFileSync(path.join(dir, '.devsanitizeignore'), 'fixtures/public/\n*.min.js\n');
  fs.writeFileSync(path.join(dir, 'fixtures', 'public', 'data.env'), 'API_KEY=abc123456789');
  fs.writeFileSync(path.join(dir, 'app.min.js'), 'const x = "abc123456789";');
  fs.writeFileSync(path.join(dir, 'app.js'), 'const x = "abc123456789";');

  const result = collectFiles(['.'], { cwd: dir });

  assert.deepEqual(result.files, ['app.js']);
});

test('collectFiles skips binary and large files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsanitize-'));

  fs.writeFileSync(path.join(dir, 'binary.dat'), Buffer.from([0, 1, 2, 3]));
  fs.writeFileSync(path.join(dir, 'large.log'), Buffer.alloc(MAX_FILE_BYTES + 1, 'a'));

  const result = collectFiles(['.'], { cwd: dir });

  assert.deepEqual(result.files, []);
  assert.deepEqual(
    result.skipped.map(item => item.reason).sort(),
    ['binary', 'too_large']
  );
});

test('ignored handles common ignore patterns', () => {
  assert.equal(ignored('dist/app.js', false, ['dist/']), true);
  assert.equal(ignored('app.min.js', false, ['*.min.js']), true);
  assert.equal(ignored('src/app.js', false, ['*.min.js']), false);
});
