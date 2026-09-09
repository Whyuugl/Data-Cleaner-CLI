const fs = require('fs');
const path = require('path');

const { anonymize } = require('../core/anonymizer');

function anonymizedPath(filePath) {
  const parsed = path.parse(filePath);

  if (!parsed.ext) {
    return path.join(parsed.dir, `${parsed.base}.anonymized`);
  }

  return path.join(parsed.dir, `${parsed.name}.anonymized${parsed.ext}`);
}

function anonymizeCommand(args) {
  const filePath = args[0];

  if (!filePath) {
    console.log('\n❌ Please provide a file to anonymize.');
    console.log('Example: dev-sanitize anonymize examples/sample.json\n');
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

  const result = anonymize(content);

  console.log('\n====================================');
  console.log('DevSanitize Anonymize');
  console.log('====================================\n');

  if (result.detections.length === 0) {
    console.log('✅ No sensitive data detected.\n');
    console.log('No anonymized file was created.\n');
    return;
  }

  const outputPath = anonymizedPath(filePath);

  try {
    fs.writeFileSync(path.resolve(outputPath), result.output, 'utf8');
  } catch (error) {
    console.log(`\n❌ Failed to write anonymized file: ${outputPath}`);
    console.log(`${error.message}\n`);
    return;
  }

  console.log(`Input : ${filePath}`);
  console.log(`Output: ${outputPath}\n`);
  console.log('Anonymized:');

  const summary = {};

  for (const detection of result.detections) {
    summary[detection.type] = (summary[detection.type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(summary)) {
    console.log(`  ${type.padEnd(13)}: ${count}`);
  }

  console.log('\n✅ Anonymization completed.\n');
  console.log(`${result.detections.length} sensitive value(s) anonymized.\n`);
  console.log('Original file was not modified.\n');
}

module.exports = {
  anonymizeCommand,
  anonymizedPath
};
