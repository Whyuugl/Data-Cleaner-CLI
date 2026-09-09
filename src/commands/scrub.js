const fs = require('fs');
const path = require('path');

const { sanitize } = require('../core/sanitizer');

function parseArgs(args) {
  const options = {
    dryRun: args.includes('--dry-run'),
    output: null,
    filePath: null
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--output') {
      options.output = args[index + 1] || null;
      index += 1;
      continue;
    }

    if (!arg.startsWith('--') && !options.filePath) {
      options.filePath = arg;
    }
  }

  return options;
}

function sanitizedPath(filePath) {
  const parsed = path.parse(filePath);

  if (!parsed.ext) {
    return path.join(parsed.dir, `${parsed.base}.sanitized`);
  }

  return path.join(parsed.dir, `${parsed.name}.sanitized${parsed.ext}`);
}

function scrubCommand(args) {
  const options = parseArgs(args);
  const filePath = options.filePath;

  if (!filePath) {
    console.log('\n❌ Please provide a file to scrub.');
    console.log('Example: dev-sanitize scrub examples/sample.json\n');
    return;
  }

  if (args.includes('--output') && !options.output) {
    console.log('\n❌ Please provide a path after --output.\n');
    return;
  }

  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.log(`\n❌ File not found: ${filePath}\n`);
    return;
  }

  let content;

  try {
    content = fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    console.log(`\n❌ Failed to read file: ${filePath}`);
    console.log(`${error.message}\n`);
    return;
  }

  const result = sanitize(content);

  console.log('\n====================================');
  console.log('🧹 DevSanitize Scrub');
  console.log('====================================\n');

  if (result.detections.length === 0) {
    console.log('✅ No sensitive data detected.\n');
    console.log('No sanitized file was created.\n');
    return;
  }

  const outputPath = options.output || sanitizedPath(filePath);

  if (!options.dryRun) {
    try {
      fs.writeFileSync(path.resolve(outputPath), result.output, 'utf8');
    } catch (error) {
      console.log(`\n❌ Failed to write sanitized file: ${outputPath}`);
      console.log(`${error.message}\n`);
      return;
    }
  }

  console.log(`Input : ${filePath}`);
  console.log(`Output: ${options.dryRun ? '(dry run)' : outputPath}\n`);
  console.log('Sanitized:');

  const summary = {};

  for (const detection of result.detections) {
    summary[detection.type] = (summary[detection.type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(summary)) {
    console.log(`  ${type.padEnd(13)}: ${count}`);
  }

  console.log(`\n${options.dryRun ? '✅ Dry run completed.' : '✅ Sanitization completed.'}\n`);
  console.log(`${result.detections.length} sensitive value(s) ${options.dryRun ? 'would be sanitized' : 'sanitized'}.\n`);
  console.log('Original file was not modified.\n');
}

module.exports = {
  scrubCommand,
  parseArgs,
  sanitizedPath
};
