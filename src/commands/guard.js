const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { collectFiles } = require('../core/files');
const { scan } = require('../core/scanner');

const BLOCKING_SEVERITIES = new Set(['critical', 'high']);

function stagedFiles() {
  const output = execFileSync('git', [
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACMRTUXB'
  ], {
    encoding: 'utf8'
  });

  return output.split(/\r?\n/).filter(Boolean);
}

function blockingDetections(detections) {
  return detections.filter(detection => BLOCKING_SEVERITIES.has(detection.severity));
}

function scanFiles(filePaths) {
  const { files, skipped } = collectFiles(filePaths);
  const results = [];

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(path.resolve(filePath), 'utf8');
      const detections = scan(content);

      results.push({
        filePath,
        detections,
        blocking: blockingDetections(detections)
      });
    } catch {
      skipped.push({ path: filePath, reason: 'read_error' });
    }
  }

  return { results, skipped };
}

function guardCommand(args) {
  let filePaths = args;

  if (filePaths.length === 0) {
    try {
      filePaths = stagedFiles();
    } catch {
      console.log('\n❌ Unable to read staged Git files.');
      console.log('Run inside a Git repository, or pass files explicitly:\n  dev-sanitize guard <file>\n');
      process.exitCode = 2;
      return;
    }
  }

  if (filePaths.length === 0) {
    console.log('\n✅ No staged files to scan.\n');
    return;
  }

  const { results, skipped } = scanFiles(filePaths);
  const blocked = results.filter(result => result.blocking.length > 0);

  if (skipped.length > 0) {
    console.log(`\n⚠️  ${skipped.length} file(s) skipped.`);
  }

  if (blocked.length === 0) {
    console.log('\n✅ Git guard passed.');
    console.log('No high or critical sensitive data detected.\n');
    if (skipped.length > 0) process.exitCode = 2;
    return;
  }

  console.log('\n❌ Git guard blocked this commit.\n');

  for (const result of blocked) {
    console.log(result.filePath);

    for (const detection of result.blocking) {
      console.log(`  [${detection.severity.toUpperCase()}] ${detection.type} line ${detection.line}: ${detection.preview}`);
    }

    console.log('');
  }

  console.log('Sanitize these values before committing.\n');
  process.exitCode = 1;
}

module.exports = {
  guardCommand,
  blockingDetections,
  scanFiles,
  stagedFiles
};
