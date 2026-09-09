const fs = require('fs');
const path = require('path');

const { collectFiles } = require('../core/files');
const { scan } = require('../core/scanner');

function summarize(detections) {
  const summary = {};

  for (const detection of detections) {
    summary[detection.type] = (summary[detection.type] || 0) + 1;
  }

  return summary;
}

function publicDetections(detections) {
  return detections.map(({ file, type, severity, preview, index, line }) => ({
    file,
    type,
    severity,
    preview,
    index,
    line
  }));
}

function scanFile(filePath) {
  const content = fs.readFileSync(path.resolve(filePath), 'utf8');
  const detections = scan(content).map(detection => ({
    ...detection,
    file: filePath
  }));

  return {
    file: filePath,
    size: content.length,
    detections
  };
}

function scanCommand(args) {
  const json = args.includes('--json');
  const quiet = args.includes('--quiet');
  const ci = args.includes('--ci');
  const target = args.find(arg => !arg.startsWith('--'));

  if (!target) {
    console.log('\n❌ Please provide a file or directory to scan.');
    console.log('Example: dev-sanitize scan examples/sample.json\n');
    if (ci) process.exitCode = 2;
    return;
  }

  const resolvedTarget = path.resolve(target);

  if (!fs.existsSync(resolvedTarget)) {
    console.log(`\n❌ File not found: ${target}\n`);
    if (ci) process.exitCode = 2;
    return;
  }

  const { files, skipped } = collectFiles([target]);
  const results = [];

  for (const file of files) {
    try {
      results.push(scanFile(file));
    } catch {
      skipped.push({ path: file, reason: 'read_error' });
    }
  }

  const detections = results.flatMap(result => result.detections);
  const summary = summarize(detections);
  const fatalSkipped = skipped.filter(item =>
    ['not_found', 'read_error', 'too_large'].includes(item.reason)
  );

  if (ci) {
    if (fatalSkipped.length > 0) {
      process.exitCode = 2;
    } else if (detections.length > 0) {
      process.exitCode = 1;
    }
  }

  if (json) {
    console.log(JSON.stringify({
      file: target,
      status: detections.length > 0 ? 'unsafe' : 'clean',
      scanned: results.length,
      skipped,
      size: results.reduce((total, result) => total + result.size, 0),
      count: detections.length,
      summary,
      detections: publicDetections(detections)
    }, null, 2));
    return;
  }

  if (quiet) {
    console.log(
      detections.length === 0
        ? 'No sensitive data detected.'
        : `${detections.length} sensitive value(s) detected.`
    );
    if (skipped.length > 0) {
      console.log(`${skipped.length} file(s) skipped.`);
    }
    return;
  }

  console.log('\n====================================');
  console.log('🛡️  DevSanitize Security Scan');
  console.log('====================================\n');

  if (results.length === 1 && target === results[0].file) {
    console.log(`File: ${target}`);
    console.log(`Size: ${results[0].size} characters\n`);
  } else {
    console.log(`Target: ${target}`);
    console.log(`Files scanned: ${results.length}`);
    console.log(`Files skipped: ${skipped.length}\n`);
  }

  if (detections.length === 0) {
    console.log('✅ No sensitive data detected.\n');
    console.log('File appears safe based on the currently enabled detectors.\n');
    printSkipped(skipped);
    return;
  }

  console.log('⚠️  Sensitive data detected:\n');

  detections.forEach((detection, index) => {
    console.log(
      `${index + 1}. [${detection.severity.toUpperCase()}] ${detection.type}`
    );

    if (results.length > 1 || target !== detection.file) {
      console.log(`   File : ${detection.file}`);
    }

    console.log(`   Line : ${detection.line}`);
    console.log(`   Value: ${detection.preview}`);
    console.log('');
  });

  console.log('------------------------------------');
  console.log('Summary:');

  for (const [type, count] of Object.entries(summary)) {
    console.log(`  ${type}: ${count}`);
  }

  console.log('');
  console.log(`${detections.length} sensitive value(s) detected.`);
  console.log('------------------------------------\n');
  printSkipped(skipped);
}

function printSkipped(skipped) {
  if (skipped.length === 0) {
    return;
  }

  console.log('Skipped:');

  for (const item of skipped) {
    console.log(`  ${item.path}: ${item.reason}`);
  }

  console.log('');
}

module.exports = {
  scanCommand,
  scanFile,
  summarize,
  publicDetections
};
