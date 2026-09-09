#!/usr/bin/env node

const { scanCommand } = require('../src/commands/scan');
const { scrubCommand } = require('../src/commands/scrub');
const { anonymizeCommand } = require('../src/commands/anonymize');
const { guardCommand } = require('../src/commands/guard');

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
====================================
🛡️  DevSanitize
====================================

Safe Data for Development

Usage:
  dev-sanitize <command> [options]

Commands:
  scan <file>       Scan file for sensitive data
  scrub <file>      Create a sanitized copy of a file
  anonymize <file>  Create a pseudonymous copy of a file
  guard [file...]   Block commits with high or critical findings

Examples:
  dev-sanitize scan examples/sample.json --json
  dev-sanitize scan examples/sample.json --quiet
  dev-sanitize scan examples/sample.json --ci
  dev-sanitize scrub examples/sample.json --output safe.json
  dev-sanitize scrub examples/sample.json --dry-run
  dev-sanitize anonymize examples/sample.json
  dev-sanitize guard

Options:
  --json            Print scan results as JSON
  --quiet           Print compact scan output
  --ci              Use CI exit codes for scan
  --output <file>   Write scrub output to a custom file
  --dry-run         Preview scrub result without writing a file
  --help            Show this help message
`);
}

if (!command || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

switch (command) {
  case 'scan':
    scanCommand(args.slice(1));
    break;

  case 'scrub':
    scrubCommand(args.slice(1));
    break;

  case 'anonymize':
    anonymizeCommand(args.slice(1));
    break;

  case 'guard':
    guardCommand(args.slice(1));
    break;

  default:
    console.log(`\n❌ Unknown command: "${command}"`);
    console.log('Run:\n  dev-sanitize --help\n');
    process.exitCode = 1;
}
