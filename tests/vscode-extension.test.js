const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('VS Code extension manifest points at the local extension entry', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'vscode-extension', 'package.json'), 'utf8')
  );

  assert.equal(manifest.main, './extension.js');
  assert.deepEqual(manifest.activationEvents, [
    'onCommand:devsanitize.scanCurrentFile',
    'onCommand:devsanitize.scrubCurrentFile'
  ]);
});
